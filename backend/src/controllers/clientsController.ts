/**
 * Clients Controller
 * References: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/CANONICAL/DATA_DICTIONARY.md (D-001)
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Generate client public_id: CL-XXXXXX
const generateClientPublicId = async (): Promise<string> => {
  const result = await query(
    `SELECT COUNT(*) as count FROM clients WHERE public_id LIKE 'CL-%'`
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `CL-${String(count).padStart(6, '0')}`;
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { client_id } = req.params;

    const result = await query(
      `SELECT id, public_id, email, name, phone, city, inn, created_at, updated_at 
       FROM clients WHERE id = $1 AND is_active = true`,
      [client_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    return res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get client error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get client',
      },
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { client_id } = req.params;
    const { name, phone, city, inn } = req.body;

    // Validate client exists
    const checkResult = await query(
      'SELECT id FROM clients WHERE id = $1 AND is_active = true',
      [client_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    // Update fields
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    if (phone) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }
    if (city) {
      updates.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }
    if (inn) {
      updates.push(`inn = $${paramIndex}`);
      params.push(inn);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one field required',
        },
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(client_id);

    const sql = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);

    return res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update client error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update client',
      },
    });
  }
};

export const registerClient = async (req: Request, res: Response) => {
  try {
    const { email, name, phone, city, inn } = req.body;

    // Validate
    if (!email || !name) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and name required',
        },
      });
    }

    // Check email uniqueness
    const checkResult = await query(
      'SELECT id FROM clients WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already registered',
        },
      });
    }

    const client_id = uuidv4();
    const public_id = await generateClientPublicId();

    const result = await query(
      `INSERT INTO clients (id, public_id, email, name, phone, city, inn, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, public_id, email, name, phone, city, inn, created_at`,
      [client_id, public_id, email, name, phone || null, city || null, inn || null]
    );

    return res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Register client error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register client',
      },
    });
  }
};
