import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import { sendNotificationAndEmail } from '../utils/notificationHelper.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name, description, price, category, stock,
      sku, brand, images, discountPrice, isFeatured, isActive
    } = req.body;

    // Validate essential required fields
    if (!name || !description || price === undefined || !category || stock === undefined || !sku) {
      res.status(400);
      throw new Error('Please provide all required fields (name, description, price, category, stock, sku)');
    }

    // Verify that the provided category actually exists in the database (by ID or Name)
    let categoryExists;
    const isCategoryId = mongoose.Types.ObjectId.isValid(category);
    if (isCategoryId) {
      categoryExists = await Category.findById(category);
    } else {
      categoryExists = await Category.findOne({ name: category });
    }

    if (!categoryExists) {
      res.status(404);
      throw new Error('Category not found');
    }

    // Ensure SKU is unique
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      res.status(400);
      throw new Error('Product with this SKU already exists');
    }

    const product = await Product.create({
      name, description, price, category: categoryExists._id, stock,
      sku, brand, images, discountPrice, isFeatured, isActive
    });

    res.status(201).json(product);
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name');
    res.status(200).json(products);
  } catch (error) {
    res.status(500);
    throw new Error('Server error while fetching products');
  }
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // If category is being updated, verify the new category exists (by ID or Name)
      if (req.body.category) {
        let categoryExists;
        const isCategoryId = mongoose.Types.ObjectId.isValid(req.body.category);
        
        if (isCategoryId && req.body.category.toString() === product.category.toString()) {
          // No change in category ID
        } else {
          if (isCategoryId) {
            categoryExists = await Category.findById(req.body.category);
          } else {
            categoryExists = await Category.findOne({ name: req.body.category });
          }

          if (!categoryExists) {
            res.status(404);
            throw new Error('Category not found');
          }
          
          req.body.category = categoryExists._id;
        }
      }

      // If sku is being updated, verify the new sku is unique
      if (req.body.sku && req.body.sku !== product.sku) {
        const skuExists = await Product.findOne({ sku: req.body.sku });
        if (skuExists) {
          res.status(400);
          throw new Error('Product with this SKU already exists');
        }
      }

      const previousStock = product.stock;
      Object.assign(product, req.body);
      const updatedProduct = await product.save();

      // Trigger wishlist back-in-stock notification if restocked from 0 units
      if (previousStock === 0 && updatedProduct.stock > 0) {
        try {
          const Wishlist = mongoose.model('Wishlist');
          const User = mongoose.model('User');
          const wishlists = await Wishlist.find({ products: updatedProduct._id });

          for (const wishlist of wishlists) {
            const usr = await User.findById(wishlist.user);
            if (usr) {
              await sendNotificationAndEmail({
                user: usr._id,
                email: usr.email,
                subject: 'Back In Stock Alert - AuraCart',
                title: 'Wishlist Item Restocked',
                message: `Good news! "${updatedProduct.name}" in your wishlist is now back in stock. Check it out and grab it before it sells out!`,
                type: 'back_in_stock',
                data: { productId: updatedProduct._id },
              });
            }
          }
        } catch (error) {
          console.error(`Error sending restock notifications: ${error.message}`);
        }
      }

      res.status(200).json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.status(200).json({ message: 'Product removed successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
});
