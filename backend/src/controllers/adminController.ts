/**
 * Admin Controller
 * Dashboard, orders management, clients management
 */

import { Request, Response } from 'express';
import { query } from '../config/database';

export const getDashboard = async (req: any, res: Response) => {
  try {
    // Total orders
    const ordersResult = await query(
      'SELECT COUNT(*) as total, status, SUM(total_amount) as sum FROM orders GROUP BY status'
    );

    // Total clients
    const clientsResult = await query(
      'SELECT COUNT(*) as total FROM clients WHERE is_active = true'
    );

    // Recent orders
    const recentOrdersResult = await query(
      `SELECT id, public_id, status, total_amount, created_at 
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    return res.json({
      status: 'success',
      data: {
        orders_by_status: ordersResult.rows,
        total_clients: clientsResult.rows[0].total,
        recent_orders: recentOrdersResult.rows,
        generated_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get dashboard',
      },
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status = null, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let sql = 'SELECT id, public_id, client_id, status, total_amount, created_at FROM orders';
    const params: any[] = [];

    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count total
    let countSql = 'SELECT COUNT(*) as total FROM orders';
    const countParams: any[] = [];

    if (status) {
      countSql += ' WHERE status = $1';
      countParams.push(status);
    }

    const countResult = await query(countSql, countParams);

    return res.json({
      status: 'success',
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get orders',
      },
    });
  }
};

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let sql = 'SELECT id, public_id, email, name, phone, city, created_at FROM clients WHERE is_active = true';
    const params: any[] = [];

    if (search) {
      sql += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count total
    let countSql = 'SELECT COUNT(*) as total FROM clients WHERE is_active = true';
    const countParams: any[] = [];

    if (search) {
      countSql += ` AND (name ILIKE $1 OR email ILIKE $1)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countSql, countParams);

    return res.json({
      status: 'success',
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    console.error('Get all clients error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get clients',
      },
    });
  }
};
