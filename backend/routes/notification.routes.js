import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notifications endpoints require authentication
router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);

router.route('/:id')
  .delete(deleteNotification);

router.put('/:id/read', markNotificationAsRead);

export default router;
