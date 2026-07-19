import express from 'express';
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(addAddress)
  .get(getAddresses);

router
  .route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
