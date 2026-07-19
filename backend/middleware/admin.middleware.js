export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && req.user.email === 'admin@auracart.com') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
