/**
 * Authentication Routes
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * GET /api/v1/auth/me
 */

import express from 'express';
import { login, logout, me } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, me);

export = router;
