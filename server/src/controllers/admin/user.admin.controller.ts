import { Request, Response } from 'express';
import User from '../../models/User';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN USER CONTROLLER - Quản lý người dùng
// ============================================================

// ─── GET /admin/nguoi-dung ────────────────────────────────────
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const filter: any = { role: 'user' };
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.render('admin/users/index', {
    title: 'Quản lý người dùng - Admin',
    users, total, page,
    totalPages: Math.ceil(total / limit),
    query: req.query,
  });
});

// ─── PATCH /admin/nguoi-dung/:id/toggle ──────────────────────
export const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('Người dùng không tồn tại', 404);
  if (user.role === 'admin') throw new AppError('Không thể vô hiệu hóa tài khoản Admin', 403);

  user.isActive = !user.isActive;
  await user.save();

  req.flash('success', `Tài khoản đã được ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
  res.redirect('/admin/nguoi-dung');
});
