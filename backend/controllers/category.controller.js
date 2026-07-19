import asyncHandler from 'express-async-handler';
import Category from '../models/category.model.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400);
      throw new Error('Category name is required');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({
      name,
      description,
      image,
      isActive,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message || 'Server error while creating category');
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500);
    throw new Error('Server error while fetching categories');
  }
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    res.status(500);
    throw new Error('Server error while fetching the category');
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      // Ensure we don't accidentally update the name to one that already exists
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
          res.status(400);
          throw new Error('Category name already exists');
        }
      }

      category.name = name || category.name;
      category.description = description !== undefined ? description : category.description;
      category.image = image !== undefined ? image : category.image;
      category.isActive = isActive !== undefined ? isActive : category.isActive;

      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    // Rethrow the exact error so the global error handler (e.g., CastError) can process it
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.status(200).json({ message: 'Category removed successfully' });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    res.status(500);
    throw new Error('Server error while deleting the category');
  }
});
