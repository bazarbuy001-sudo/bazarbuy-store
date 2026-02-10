/**
 * Catalog Controller
 * References: /Users/bazarbuy/Desktop/ТЗ для сайта Bazar Buy/Кнопка Каталог Товаров/Backend/TZ_02_BACKEND.md
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { PaginationParams, PaginatedResponse } from '../types';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { level = 1, active = true, parent_id = null } = req.query;

    let sql = 'SELECT id, name, slug, level, product_count, icon FROM categories WHERE is_active = $1';
    const params: any[] = [active];

    if (parent_id) {
      sql += ' AND parent_id = $2';
      params.push(parent_id);
    } else if (level) {
      sql += ' AND level = $2';
      params.push(level);
    }

    sql += ' ORDER BY position ASC';

    const result = await query(sql, params);

    return res.json({
      status: 'success',
      data: result.rows,
      meta: {
        total: result.rows.length,
        level: level || 1,
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get categories',
      },
    });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT id, name, slug, parent_id, level, product_count, icon FROM categories WHERE slug = $1 AND is_active = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    const category = result.rows[0];

    // Get child categories if level < 3
    let children = [];
    if (category.level < 3) {
      const childResult = await query(
        'SELECT id, name, slug, level, product_count FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY position ASC',
        [category.id]
      );
      children = childResult.rows;
    }

    return res.json({
      status: 'success',
      data: {
        ...category,
        children,
      },
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get category',
      },
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category_id, page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let sql = `
      SELECT p.id, p.public_id, p.name, p.composition, p.color, p.price_per_unit, p.stock_quantity
      FROM products p
    `;
    const params: any[] = [];

    if (category_id) {
      sql += ` JOIN category_product cp ON p.id = cp.product_id WHERE cp.category_id = $${params.length + 1}`;
      params.push(category_id);
    } else {
      sql += ' WHERE p.is_active = true';
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${params.length + 1} OR p.public_id ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM products p';
    const countParams: any[] = [];

    if (category_id) {
      countSql += ` JOIN category_product cp ON p.id = cp.product_id WHERE cp.category_id = $${countParams.length + 1}`;
      countParams.push(category_id);
    } else {
      countSql += ' WHERE p.is_active = true';
    }

    if (search) {
      countSql += ` AND (p.name ILIKE $${countParams.length + 1} OR p.public_id ILIKE $${countParams.length + 1})`;
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
        pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get products',
      },
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;

    const result = await query(
      `SELECT id, public_id, name, description, composition, width_cm, roll_length_m, 
              color, pattern, price_per_unit, unit_type, stock_quantity
       FROM products WHERE id = $1 AND is_active = true`,
      [product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    const product = result.rows[0];

    // Get images
    const imagesResult = await query(
      'SELECT image_url, alt_text FROM product_images WHERE product_id = $1 ORDER BY position ASC',
      [product_id]
    );

    // Get attributes
    const attributesResult = await query(
      'SELECT attribute_key, attribute_value FROM product_attributes WHERE product_id = $1',
      [product_id]
    );

    return res.json({
      status: 'success',
      data: {
        ...product,
        images: imagesResult.rows,
        attributes: attributesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get product',
      },
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!q) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query required',
        },
      });
    }

    const result = await query(
      `SELECT id, public_id, name, color, price_per_unit, stock_quantity
       FROM products 
       WHERE is_active = true AND (name ILIKE $1 OR public_id ILIKE $1)
       ORDER BY name ASC
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM products 
       WHERE is_active = true AND (name ILIKE $1 OR public_id ILIKE $1)`,
      [`%${q}%`]
    );

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
    console.error('Search products error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search products',
      },
    });
  }
};
