import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Order from '../models/order.model.js';

// @desc    Search and filter products with pagination, sorting, and availability check
// @route   GET /api/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  // Search keyword matching across name, description, brand, and category
  let categoryIds = [];
  if (req.query.keyword) {
    const matchingCategories = await Category.find({
      name: { $regex: req.query.keyword, $options: 'i' }
    });
    categoryIds = matchingCategories.map((c) => c._id);
  }

  const keywordFilter = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $in: categoryIds } },
        ],
      }
    : {};

  // Category filter
  const categoryFilter = req.query.category ? { category: req.query.category } : {};

  // Price range filters
  const priceMin = Number(req.query.priceMin) || 0;
  const priceMax = req.query.priceMax ? Number(req.query.priceMax) : Infinity;
  const priceFilter = { price: { $gte: priceMin, $lte: priceMax } };

  // Rating minimum filter
  const ratingMin = req.query.ratingMin ? Number(req.query.ratingMin) : 0;
  const ratingFilter = { ratings: { $gte: ratingMin } };

  // Brand filter (supports multiple brands separated by commas)
  let brandFilter = {};
  if (req.query.brand) {
    const brands = req.query.brand.split(',').map((b) => b.trim()).filter(Boolean);
    if (brands.length > 0) {
      brandFilter = { brand: { $in: brands.map((b) => new RegExp('^' + b + '$', 'i')) } };
    }
  }

  // Availability filter (e.g. out of stock or in stock)
  const availabilityFilter = req.query.inStockOnly === 'true' ? { stock: { $gt: 0 } } : {};

  // Combine query filters (Only active products are visible)
  const filterQuery = {
    ...keywordFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
    ...brandFilter,
    ...availabilityFilter,
    isActive: true,
  };

  // Sorting strategies
  let sortQuery = {};
  switch (req.query.sort) {
    case 'priceAsc':
      sortQuery = { price: 1 };
      break;
    case 'priceDesc':
      sortQuery = { price: -1 };
      break;
    case 'rating':
    case 'highestRated':
      sortQuery = { ratings: -1, numReviews: -1 };
      break;
    case 'popular':
    case 'mostPopular':
      sortQuery = { numReviews: -1, ratings: -1 };
      break;
    case 'latest':
    case 'newest':
    default:
      sortQuery = { createdAt: -1 };
  }

  const count = await Product.countDocuments(filterQuery);
  const products = await Product.find(filterQuery)
    .populate('category', 'name')
    .sort(sortQuery)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get Instant Search Suggestions
// @route   GET /api/search/suggestions
// @access  Public
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  if (!keyword || keyword.trim() === '') {
    return res.status(200).json([]);
  }

  const cleanedKeyword = keyword.trim();

  // Query products and categories in parallel
  const [matchingProducts, matchingCategories] = await Promise.all([
    Product.find({
      $or: [
        { name: { $regex: cleanedKeyword, $options: 'i' } },
        { brand: { $regex: cleanedKeyword, $options: 'i' } },
      ],
      isActive: true,
    })
      .limit(6)
      .select('name brand category'),
    Category.find({
      name: { $regex: cleanedKeyword, $options: 'i' },
    })
      .limit(3)
      .select('name'),
  ]);

  const suggestions = [];

  // Add category suggestions
  matchingCategories.forEach((c) => {
    suggestions.push({ type: 'category', text: c.name, id: c._id });
  });

  // Add product suggestions
  matchingProducts.forEach((p) => {
    suggestions.push({ type: 'product', text: p.name, id: p._id, brand: p.brand });
  });

  res.status(200).json(suggestions);
});

// @desc    Get Trending Section products
// @route   GET /api/search/trending
// @access  Public
export const getTrendingProducts = asyncHandler(async (req, res) => {
  try {
    // 1. New Arrivals: Sort by createdAt
    const newArrivals = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(4);

    // 2. Top Rated: Sort by ratings
    const topRated = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ ratings: -1, numReviews: -1 })
      .limit(4);

    // 3. Featured Products:
    const featured = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name')
      .limit(4);

    // 4. Best Sellers: Aggregate from orders quantities
    const bestSellerIds = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', count: { $sum: '$orderItems.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    const bestSellerProductIds = bestSellerIds.map((item) => item._id);
    let bestSellers = [];
    if (bestSellerProductIds.length > 0) {
      bestSellers = await Product.find({ _id: { $in: bestSellerProductIds }, isActive: true }).populate('category', 'name');
    }

    // Fallback: If no orders are placed yet, use top rating for Best Sellers
    if (bestSellers.length === 0) {
      bestSellers = await Product.find({ isActive: true })
        .populate('category', 'name')
        .sort({ ratings: -1 })
        .limit(4);
    }

    res.status(200).json({
      bestSellers,
      newArrivals,
      topRated,
      featured,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while generating trending sections.');
  }
});

// @desc    Get Frequently Bought Together products
// @route   GET /api/search/together/:id
// @access  Public
export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
  if (!productId) {
    return res.status(400).json([]);
  }

  // Find paid orders containing this product
  const orders = await Order.find({
    paymentStatus: 'Paid',
    'orderItems.product': productId,
  });

  const productCounts = {};
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.product.toString() !== id) {
        productCounts[item.product] = (productCounts[item.product] || 0) + item.quantity;
      }
    });
  });

  // Sort matched products descending
  const sortedIds = Object.keys(productCounts)
    .sort((a, b) => productCounts[b] - productCounts[a])
    .slice(0, 3);

  let togetherProducts = [];
  if (sortedIds.length > 0) {
    togetherProducts = await Product.find({ _id: { $in: sortedIds }, isActive: true }).populate('category', 'name');
  }

  // Fallback: Return top products in the same category
  if (togetherProducts.length === 0) {
    const currentProduct = await Product.findById(productId);
    if (currentProduct) {
      togetherProducts = await Product.find({
        category: currentProduct.category,
        _id: { $ne: productId },
        isActive: true,
      })
        .limit(3)
        .populate('category', 'name');
    }
  }

  res.status(200).json(togetherProducts);
});

// @desc    Get Personalized Recommendations (Recommended for You)
// @route   GET /api/search/recommendations
// @access  Public (Optional Authentication)
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;
  let recommended = [];

  // If user is authenticated, query their top categories from past orders
  if (req.user) {
    const topCategories = await Order.aggregate([
      { $match: { user: req.user._id, paymentStatus: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      { $group: { _id: '$productDetails.category', count: { $sum: '$orderItems.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 2 },
    ]);

    const categoryIds = topCategories.map((cat) => cat._id);
    if (categoryIds.length > 0) {
      recommended = await Product.find({
        category: { $in: categoryIds },
        isActive: true,
      })
        .sort({ ratings: -1, numReviews: -1 })
        .limit(limit)
        .populate('category', 'name');
    }
  }

  // Fallback: If guest or no purchase history, recommend top-rated featured products
  if (recommended.length === 0) {
    recommended = await Product.find({ isActive: true })
      .sort({ ratings: -1, isFeatured: -1 })
      .limit(limit)
      .populate('category', 'name');
  }

  res.status(200).json(recommended);
});

// @desc    Get Recently Viewed Products Details by IDs list
// @route   GET /api/search/recently-viewed
// @access  Public
export const getRecentlyViewedProducts = asyncHandler(async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(200).json([]);
  }

  const idsArray = ids.split(',').filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (idsArray.length === 0) {
    return res.status(200).json([]);
  }

  const products = await Product.find({ _id: { $in: idsArray }, isActive: true }).populate('category', 'name');
  
  // Sort the returned products array in the exact order of the queried IDs
  const sortedProducts = idsArray
    .map((id) => products.find((p) => p._id.toString() === id))
    .filter(Boolean);

  res.status(200).json(sortedProducts);
});

// @desc    Get featured products (legacy support)
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name')
    .limit(limit);
  res.status(200).json(products);
});

// @desc    Get latest products (legacy support)
export const getLatestProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ isActive: true })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.status(200).json(products);
});

// @desc    Get related products (legacy support)
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Number(req.query.limit) || 4;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: id },
    isActive: true,
  })
    .populate('category', 'name')
    .limit(limit);

  res.status(200).json(related);
});
