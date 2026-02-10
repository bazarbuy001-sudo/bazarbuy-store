/**
 * Admin Routes
 * GET /api/v1/admin/dashboard - Dashboard
 * GET /api/v1/admin/orders - All orders
 * GET /api/v1/admin/clients - All clients
 */

import express from 'express';
import {
  getDashboard,
  getAllOrders,
  getAllClients,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Admin-only routes
router.get('/dashboard', authenticateToken, requireRole(['admin', 'superadmin']), getDashboard);
router.get('/orders', authenticateToken, requireRole(['admin', 'manager', 'superadmin']), getAllOrders);
router.get('/clients', authenticateToken, requireRole(['admin', 'superadmin']), getAllClients);

export = router;
