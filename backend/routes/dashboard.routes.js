import express from 'express';
import {
  getAdminDashboard,
  getUserDashboard,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/user', getUserDashboard);
router.get('/admin', admin, getAdminDashboard);

export default router;
