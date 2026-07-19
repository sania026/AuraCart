import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {
  searchProducts,
  getSearchSuggestions,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations,
  getRecentlyViewedProducts,
  getFeaturedProducts,
  getLatestProducts,
  getRelatedProducts,
} from '../controllers/search.controller.js';

const router = express.Router();

// Optional authentication middleware to load user context if available
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      // Fail silently and treat user as guest
    }
  }
  next();
};

// Search suggests and aggregations
router.get('/', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingProducts);
router.get('/together/:id', getFrequentlyBoughtTogether);
router.get('/recommendations', optionalProtect, getPersonalizedRecommendations);
router.get('/recently-viewed', getRecentlyViewedProducts);

// Legacy/Compatibility Routes
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/related/:id', getRelatedProducts);

export default router;
