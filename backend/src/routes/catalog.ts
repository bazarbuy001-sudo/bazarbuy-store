/**
 * Catalog Routes
 * GET /api/v1/catalog/categories - List categories
 * GET /api/v1/catalog/categories/:slug - Get category
 * GET /api/v1/catalog/products - List products
 * GET /api/v1/catalog/products/:product_id - Get product
 * GET /api/v1/catalog/search - Search products
 */

import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductById,
  searchProducts,
} from '../controllers/catalogController';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/products', getProducts);
router.get('/products/:product_id', getProductById);
router.get('/search', searchProducts);

export = router;
