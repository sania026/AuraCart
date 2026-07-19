import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Coupon from '../models/coupon.model.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error('Coupon is inactive');
  }

  if (coupon.isExpired()) {
    res.status(400);
    throw new Error('Coupon has expired');
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const currentOrderVal = Number(orderValue) || 0;
  if (currentOrderVal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value of ${coupon.minOrderValue} is required to apply this coupon`);
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (currentOrderVal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed order value
  discountAmount = Math.min(discountAmount, currentOrderVal);

  res.status(200).json({
    message: 'Coupon is valid',
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Number(discountAmount.toFixed(2)),
  });
});

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderValue, expiryDate, isActive, usageLimit } = req.body;

  if (!code || !discountValue || !expiryDate) {
    res.status(400);
    throw new Error('Please provide code, discountValue, and expiryDate');
  }

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderValue,
    expiryDate,
    isActive,
    usageLimit,
  });

  // Broadcast coupon notification to all active customers in the background
  try {
    const User = mongoose.model('User');
    const Notification = mongoose.model('Notification');
    const users = await User.find({ role: 'user' });

    if (users.length > 0) {
      const discountSymbol = coupon.discountType === 'percentage' ? '%' : '₹';
      const notificationLogs = users.map((u) => ({
        user: u._id,
        title: 'New Coupon Available!',
        message: `Hurry! Use the coupon code "${coupon.code}" to save ${coupon.discountValue}${discountSymbol} on your next order! Coupon expires on ${new Date(coupon.expiryDate).toLocaleDateString()}.`,
        type: 'new_offer',
      }));
      await Notification.insertMany(notificationLogs);
    }
  } catch (error) {
    console.error(`Error broadcasting coupon alerts: ${error.message}`);
  }

  res.status(201).json(coupon);
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json(coupons);
});

// @desc    Update a coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const { discountType, discountValue, minOrderValue, expiryDate, isActive, usageLimit } = req.body;
  const couponId = req.params.id;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.discountType = discountType || coupon.discountType;
  coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
  coupon.minOrderValue = minOrderValue !== undefined ? minOrderValue : coupon.minOrderValue;
  coupon.expiryDate = expiryDate || coupon.expiryDate;
  coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
  coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;

  const updatedCoupon = await coupon.save();
  res.status(200).json(updatedCoupon);
});

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await Coupon.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Coupon deleted successfully' });
});
