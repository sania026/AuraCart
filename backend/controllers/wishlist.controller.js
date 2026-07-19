import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    select: 'name price images stock sku brand isActive',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json(wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }

  if (wishlist.products.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  wishlist.products.push(productId);
  await wishlist.save();
  await wishlist.populate({
    path: 'products',
    select: 'name price images stock sku brand isActive',
  });

  res.status(200).json(wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    (prod) => prod.toString() !== productId
  );

  await wishlist.save();
  await wishlist.populate({
    path: 'products',
    select: 'name price images stock sku brand isActive',
  });

  res.status(200).json(wishlist);
});
