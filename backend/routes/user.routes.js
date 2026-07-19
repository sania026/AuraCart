import express from 'express';
import { getUsers, deleteUser, updateUserRole } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Route Guard: Protect all endpoints under /api/users to be private & admin-only
router.use(protect);
router.use(admin);

router.route('/').get(getUsers);
router.route('/:id').delete(deleteUser);
router.route('/:id/role').put(updateUserRole);

export default router;
