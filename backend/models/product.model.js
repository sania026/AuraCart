import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        // Custom validator to ensure discount is less than actual price
        validator: function (value) {
          // if discountPrice is not provided, it's valid
          if (value == null) return true;
          return value < this.price;
        },
        message: 'Discount price must be lower than the regular price',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to improve search and filtering query performance
productSchema.index({ name: 'text', description: 'text' }); // Enables full-text search
productSchema.index({ category: 1 }); // Speeds up queries filtering by category
productSchema.index({ price: 1 }); // Speeds up sorting or filtering by price
productSchema.index({ brand: 1 }); // Speeds up queries filtering by brand

const Product = mongoose.model('Product', productSchema);

export default Product;
