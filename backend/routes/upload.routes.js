import express from 'express';
import upload from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

// Route to handle multiple image uploads (limit 5 files at once)
router.post('/', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one image file');
  }

  // Retrieve paths of the uploaded files from Cloudinary storage
  const fileUrls = req.files.map((file) => file.path);

  res.status(200).json({
    message: 'Images uploaded successfully to Cloudinary',
    urls: fileUrls,
  });
});

export default router;
