import asyncHandler from 'express-async-handler';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// Helper function to update product ratings
const updateProductRatingInfo = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const ratings =
    numReviews > 0
      ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews).toFixed(1))
      : 0;

  await Product.findByIdAndUpdate(productId, {
    numReviews,
    ratings,
  });
};

// @desc    Add product review
// @route   POST /api/reviews
// @access  Private
export const addProductReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide all required fields (productId, rating, comment)');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if review already exists
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed by you');
  }

  // Check if the user has purchased the product to set isVerifiedPurchase
  const userHasPurchased = await Order.findOne({
    user: req.user._id,
    paymentStatus: 'Paid',
    'orderItems.product': productId,
  });

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: Number(rating),
    comment,
    isVerifiedPurchase: !!userHasPurchased,
  });

  await updateProductRatingInfo(productId);

  res.status(201).json(review);
});

// @desc    Update product review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Ensure user owns the review
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this review');
  }

  review.rating = rating !== undefined ? Number(rating) : review.rating;
  review.comment = comment !== undefined ? comment : review.comment;

  const updatedReview = await review.save();

  await updateProductRatingInfo(review.product);

  res.status(200).json(updatedReview);
});

// @desc    Delete product review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteProductReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Ensure user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;

  await Review.deleteOne({ _id: reviewId });

  await updateProductRatingInfo(productId);

  res.status(200).json({ message: 'Review deleted successfully' });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(reviews);
});
