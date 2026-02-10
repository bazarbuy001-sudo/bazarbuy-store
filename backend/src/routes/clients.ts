/**
 * Clients Routes
 * POST /api/v1/clients - Register client
 * GET /api/v1/clients/:client_id - Get client
 * PUT /api/v1/clients/:client_id - Update client
 */

import express from 'express';
import {
  registerClient,
  getClientById,
  updateClient,
} from '../controllers/clientsController';

const router = express.Router();

router.post('/', registerClient);
router.get('/:client_id', getClientById);
router.put('/:client_id', updateClient);

export = router;
