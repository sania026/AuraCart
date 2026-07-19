import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.use(protect);

// User coupon actions
router.post('/validate', validateCoupon);

// Admin-only CRUD actions
router.use(admin);
router
  .route('/')
  .post(createCoupon)
  .get(getAllCoupons);

router
  .route('/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
