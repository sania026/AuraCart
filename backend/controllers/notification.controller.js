import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.model.js';

// @desc    Get user/admin notifications with pagination
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const query = req.user.role === 'admin'
    ? { $or: [{ user: req.user._id }, { isAdmin: true }] }
    : { user: req.user._id };

  const count = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  const unreadCount = await Notification.countDocuments({
    ...query,
    isRead: false,
  });

  res.status(200).json({
    notifications,
    page,
    pages: Math.ceil(count / limit),
    total: count,
    unreadCount,
  });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Ensure notification belongs to user or is admin notification for admin
  if (
    notification.user?.toString() !== req.user._id.toString() &&
    !(notification.isAdmin && req.user.role === 'admin')
  ) {
    res.status(403);
    throw new Error('Not authorized to modify this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { $or: [{ user: req.user._id }, { isAdmin: true }] }
    : { user: req.user._id };

  await Notification.updateMany({ ...query, isRead: false }, { isRead: true });

  res.status(200).json({ message: 'All notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (
    notification.user?.toString() !== req.user._id.toString() &&
    !(notification.isAdmin && req.user.role === 'admin')
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await Notification.deleteOne({ _id: notification._id });

  res.status(200).json({ message: 'Notification deleted successfully' });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
export const clearAllNotifications = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { $or: [{ user: req.user._id }, { isAdmin: true }] }
    : { user: req.user._id };

  await Notification.deleteMany(query);

  res.status(200).json({ message: 'All notifications cleared successfully' });
});
