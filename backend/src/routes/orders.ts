/**
 * Orders Routes
 * POST /api/v1/orders - Create order
 * GET /api/v1/orders/:order_id - Get order
 * PUT /api/v1/orders/:order_id/status - Update status
 * GET /api/v1/orders/client/:client_id - Get client orders
 */

import express from 'express';
import { createOrder, getOrder, updateOrderStatus, getClientOrders } from '../controllers/ordersController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes (for clients)
router.post('/', createOrder);
router.get('/:order_id', getOrder);
router.get('/client/:client_id', getClientOrders);

// Admin routes (protected)
router.put('/:order_id/status', authenticateToken, requireRole(['admin', 'manager']), updateOrderStatus);

export = router;
