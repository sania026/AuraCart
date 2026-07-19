import asyncHandler from 'express-async-handler';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price images stock sku brand isActive',
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  console.log('--- REQ BODY ---', req.body);
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.isActive) {
    res.status(400);
    throw new Error('Product is inactive and cannot be added to cart');
  }

  if (product.stock < qty) {
    res.status(400);
    throw new Error(`Insufficient stock. Available stock: ${product.stock}`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + qty;
    if (product.stock < newQty) {
      res.status(400);
      throw new Error(`Cannot add more. Total in cart would exceed available stock (${product.stock})`);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price images stock sku brand isActive',
  });

  res.status(200).json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price images stock sku brand isActive',
  });

  res.status(200).json(cart);
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart
// @access  Private
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  if (!productId || qty === undefined || qty < 1) {
    res.status(400);
    throw new Error('Valid Product ID and quantity >= 1 are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < qty) {
    res.status(400);
    throw new Error(`Insufficient stock. Available stock: ${product.stock}`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = qty;
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock sku brand isActive',
    });
    res.status(200).json(cart);
  } else {
    res.status(404);
    throw new Error('Product not found in cart');
  }
});

// @desc    Clear user's cart
// @route   POST /api/cart/clear
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  } else {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json(cart);
});
