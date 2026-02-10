/**
 * Authentication Controller
 * References: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md
 * Admin users (D-001)
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { query } from '../config/database';
import { AdminUser, JWTPayload } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password required',
        },
      });
    }

    // Find admin user
    const result = await query(
      'SELECT id, public_id, email, password_hash, role, first_name, last_name FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24h
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');

    // Log last login
    await query(
      'UPDATE admin_users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    return res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          public_id: user.public_id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  // JWT is stateless, so logout is just client-side
  return res.json({
    status: 'success',
    data: { message: 'Logged out successfully' },
  });
};

export const me = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
      });
    }

    const result = await query(
      'SELECT id, public_id, email, role, first_name, last_name FROM admin_users WHERE id = $1',
      [req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
};
