import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Wishlist from '../models/wishlist.model.js';
import Address from '../models/address.model.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { sendNotificationAndEmail } from '../utils/notificationHelper.js';

// Helper to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (generates OTP)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // If registered but not verified, overwrite registration details and generate new OTP
      userExists.name = name;
      userExists.password = password; // Hashing will be triggered in pre-save hook
      userExists.otp = otp;
      userExists.otpExpiry = otpExpiry;
      await userExists.save();
    } else {
      // Create unverified user
      await User.create({
        name,
        email,
        password,
        role: 'user',
        isVerified: false,
        otp,
        otpExpiry,
      });
    }

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Email Verification - AuraCart',
      text: `Your email verification OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to AuraCart!</h2>
          <p>Thank you for signing up. Please verify your email address by entering the following One-Time Password (OTP):</p>
          <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; color: #111827; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: 'Verification OTP sent to your email. Please check your inbox.',
      email,
    });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if user has verified their email address
      if (!user.isVerified) {
        return res.status(400).json({
          message: 'Please verify your email first.',
          unverified: true,
          email: user.email,
        });
      }

      const token = generateToken(user._id, user.role);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP code has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Trigger verification notification & welcome email
    await sendNotificationAndEmail({
      user: user._id,
      email: user.email,
      subject: 'Account Verified - Welcome to AuraCart!',
      title: 'Email Verified',
      message: `Hi ${user.name}, your email has been successfully verified. Welcome to AuraCart! Explore our latest collections now.`,
      type: 'new_user',
    });

    // Notify Admins about the new customer registration
    await sendNotificationAndEmail({
      isAdmin: true,
      title: 'New Customer Registered',
      message: `A new customer, ${user.name} (${user.email}), has registered and verified their account.`,
      type: 'new_user',
      data: { userId: user._id },
    });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Email verified successfully!',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Email Verification - AuraCart',
      text: `Your email verification OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Email Verification</h2>
          <p>Your requested OTP for email verification is:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; color: #111827; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'OTP verification code resent successfully!' });
  } catch (error) {
    console.error('Error in resendOtp:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request Password Reset (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email address.' });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Reset Password OTP - AuraCart',
      text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following OTP to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; color: #111827; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Reset OTP & Set New Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: 'OTP code has expired' });
    }

    user.password = newPassword; // Pre-save hook will hash it automatically
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    // Trigger reset confirmation notification & email
    await sendNotificationAndEmail({
      user: user._id,
      email: user.email,
      subject: 'Password Changed Alert - AuraCart',
      title: 'Password Updated',
      message: `Hi ${user.name}, your password has been successfully updated. If you did not make this change, please contact support immediately.`,
      type: 'password_reset',
    });

    res.status(200).json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Error in resetPassword:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id, updatedUser.role);

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        profilePicture: updatedUser.profilePicture || '',
        role: updatedUser.role,
        token,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete user history records
    await Promise.all([
      Order.deleteMany({ user: user._id }),
      Cart.deleteOne({ user: user._id }),
      Wishlist.deleteOne({ user: user._id }),
      Address.deleteMany({ user: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUserAccount:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
