/**
 * Orders Controller
 * References: 
 * - /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md (orders, order_items)
 * - /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/STATE_MACHINES.md (order transitions)
 * - /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/Корзина/6_CHECKOUT_DETAILED_SPEC.md
 */

import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { Order, OrderStatus } from '../types';

// Generate order public_id: ORD-YYYY-NNNNNN
const generateOrderPublicId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const result = await query(
    `SELECT COUNT(*) as count FROM orders WHERE public_id LIKE $1`,
    [`ORD-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `ORD-${year}-${String(count).padStart(6, '0')}`;
};

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, shipping_address, notes } = req.body;
    const client_id = req.params.client_id; // From URL or from auth context

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one item required',
        },
      });
    }

    // Validate client exists
    const clientResult = await query(
      'SELECT id FROM clients WHERE id = $1 AND is_active = true',
      [client_id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    // Calculate total amount and create order in transaction
    let total_amount = 0;
    const orderId = require('uuid').v4();
    const public_id = await generateOrderPublicId();

    // Validate and sum items
    for (const item of items) {
      if (!item.fabric_id || !item.requested_meters || !item.unit_price_per_meter) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid item structure',
          },
        });
      }
      total_amount += item.requested_meters * item.unit_price_per_meter;
    }

    // Create order and order items in transaction
    await transaction(async (client) => {
      // Create order
      await client.query(
        `INSERT INTO orders (id, public_id, client_id, status, total_amount, shipping_address, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [orderId, public_id, client_id, OrderStatus.PENDING, total_amount, shipping_address ? JSON.stringify(shipping_address) : null, notes]
      );

      // Create order items
      for (const item of items) {
        const total_price = item.requested_meters * item.unit_price_per_meter;
        await client.query(
          `INSERT INTO order_items (id, order_id, fabric_id, color, requested_meters, unit_price_per_meter, total_price, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            require('uuid').v4(),
            orderId,
            item.fabric_id,
            item.color,
            item.requested_meters,
            item.unit_price_per_meter,
            total_price,
          ]
        );
      }
    });

    return res.status(201).json({
      status: 'success',
      data: {
        id: orderId,
        public_id,
        status: OrderStatus.PENDING,
        total_amount,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order',
      },
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;

    const result = await query(
      `SELECT id, public_id, client_id, status, total_amount, shipping_address, notes, created_at, updated_at
       FROM orders WHERE id = $1`,
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    const order = result.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT id, fabric_id, color, requested_meters, fulfilled_meters, unit_price_per_meter, total_price
       FROM order_items WHERE order_id = $1`,
      [order_id]
    );

    return res.json({
      status: 'success',
      data: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get order',
      },
    });
  }
};

// Allowed state transitions (from STATE_MACHINES.md)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status required',
        },
      });
    }

    // Get current order
    const currentResult = await query(
      'SELECT status FROM orders WHERE id = $1',
      [order_id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    const currentStatus = currentResult.rows[0].status;

    // Validate transition (BR-ORDER-002)
    if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${currentStatus} to ${status}`,
        },
      });
    }

    // Update order
    await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, order_id]
    );

    return res.json({
      status: 'success',
      data: {
        id: order_id,
        new_status: status,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update order',
      },
    });
  }
};

export const getClientOrders = async (req: any, res: Response) => {
  try {
    const { client_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT id, public_id, client_id, status, total_amount, created_at
       FROM orders WHERE client_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [client_id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE client_id = $1',
      [client_id]
    );

    return res.json({
      status: 'success',
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get client orders error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get orders',
      },
    });
  }
};
