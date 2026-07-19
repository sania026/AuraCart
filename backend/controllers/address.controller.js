import asyncHandler from 'express-async-handler';
import Address from '../models/address.model.js';

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Count existing addresses to decide if this is the first address
  const count = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = count === 0 ? true : !!isDefault;

  // If this address is default, set all other user's addresses to not default
  if (shouldBeDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    streetAddress,
    city,
    state,
    postalCode,
    country: country || 'India',
    isDefault: shouldBeDefault,
  });

  res.status(201).json(address);
});

// @desc    Get all user addresses
// @route   GET /api/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.status(200).json(addresses);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;
  const addressId = req.params.id;

  const address = await Address.findById(addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this address');
  }

  // If toggling this address to default, set all others to false
  if (isDefault && !address.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
  } else if (isDefault === false && address.isDefault) {
    // If setting default to false, we need to ensure at least one other address is default if count > 1
    address.isDefault = false;
    const count = await Address.countDocuments({ user: req.user._id, _id: { $ne: addressId } });
    if (count > 0) {
      // make the oldest/latest address default
      const anotherAddress = await Address.findOne({ user: req.user._id, _id: { $ne: addressId } });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }
  }

  address.fullName = fullName || address.fullName;
  address.phone = phone || address.phone;
  address.streetAddress = streetAddress || address.streetAddress;
  address.city = city || address.city;
  address.state = state || address.state;
  address.postalCode = postalCode || address.postalCode;
  address.country = country || address.country;

  const updatedAddress = await address.save();
  res.status(200).json(updatedAddress);
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;

  const address = await Address.findById(addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this address');
  }

  const wasDefault = address.isDefault;

  await Address.deleteOne({ _id: addressId });

  // If the deleted address was default, make another one default
  if (wasDefault) {
    const anotherAddress = await Address.findOne({ user: req.user._id });
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }

  res.status(200).json({ message: 'Address deleted successfully' });
});
