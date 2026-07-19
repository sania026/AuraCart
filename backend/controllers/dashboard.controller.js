import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Order from '../models/order.model.js';
import Wishlist from '../models/wishlist.model.js';
import Cart from '../models/cart.model.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
export const getAdminDashboard = asyncHandler(async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    // Calculate total revenue from paid orders
    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Retrieve the latest 5 orders with username and email populated
    const latestOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate sales and orders history for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesHistory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Paid"] },
                "$totalPrice",
                0
              ]
            }
          },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format last 7 days chart data including days with zero orders
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartData.push({ date: dateStr, sales: 0, orders: 0 });
    }

    salesHistory.forEach((item) => {
      const found = chartData.find((c) => c.date === item._id);
      if (found) {
        found.sales = Number(item.sales.toFixed(2));
        found.orders = item.orders;
      }
    });

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      latestOrders,
      salesHistory: chartData,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error while aggregating admin stats.');
  }
});

// @desc    Get User Dashboard Stats
// @route   GET /api/dashboard/user
// @access  Private
export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get orders summary
  const totalOrdersCount = await Order.countDocuments({ user: userId });
  const recentOrders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(3);

  // Get wishlist items count
  const wishlist = await Wishlist.findOne({ user: userId });
  const wishlistItemsCount = wishlist ? wishlist.products.length : 0;

  // Get cart items count
  const cart = await Cart.findOne({ user: userId });
  const cartItemsCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  res.status(200).json({
    user: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address,
      createdAt: req.user.createdAt,
    },
    ordersCount: totalOrdersCount,
    recentOrders,
    wishlistItemsCount,
    cartItemsCount,
  });
});
