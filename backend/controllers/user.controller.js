import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  // Return all users sorted by date of creation, excluding password hashes
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'User deleted successfully' });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from modifying their own role
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot change your own admin role');
  }

  // Disallow promoting another user to admin for production security
  if (user.role === 'user') {
    res.status(400);
    throw new Error('Promoting users to admin is disabled for production security');
  }

  user.role = 'user';
  await user.save();

  res.status(200).json({
    message: 'User demoted successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
