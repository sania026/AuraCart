import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      validate: {
        validator: function (val) {
          if (this.discountType === 'percentage') {
            return val <= 100;
          }
          return true;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },
    minOrderValue: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited usage
      min: [1, 'Usage limit must be at least 1'],
    },
    usageCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Check if coupon is expired
couponSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
