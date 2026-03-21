import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Order from '../models/Order';
import Booking from '../models/Booking';
import catchAsync from '../utils/catchAsync';

// ============================================================
// USER CONTROLLER - Trang cá nhân người dùng
// ============================================================

// ─── GET /tai-khoan ───────────────────────────────────────────
export const getProfilePage = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).lean();
  res.render('client/profile', {
    title: 'Tài khoản của tôi - PurePaw',
    user,
    activeTab: 'profile',
  });
});

// ─── POST /tai-khoan ──────────────────────────────────────────
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { fullName, phone, street, ward, district, city } = req.body;

  await User.findByIdAndUpdate(req.user!._id, {
    fullName: fullName?.trim(),
    phone: phone?.trim(),
    address: { street, ward, district, city },
  });

  req.flash('success', 'Cập nhật thông tin thành công!');
  res.redirect('/tai-khoan');
});

// ─── POST /tai-khoan/doi-mat-khau ─────────────────────────────
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    req.flash('error', 'Mật khẩu mới không khớp');
    return res.redirect('/tai-khoan');
  }

  if (newPassword.length < 6) {
    req.flash('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
    return res.redirect('/tai-khoan');
  }

  const user = await User.findById(req.user!._id).select('+password');
  if (!user) return res.redirect('/tai-khoan');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    req.flash('error', 'Mật khẩu hiện tại không đúng');
    return res.redirect('/tai-khoan');
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Xóa cookie → force đăng nhập lại
  res.clearCookie('token');
  req.flash('success', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại');
  res.redirect('/dang-nhap');
});

// ─── GET /tai-khoan/don-hang ──────────────────────────────────
export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .lean();

  res.render('client/profile', {
    title: 'Đơn hàng của tôi - PurePaw',
    user: req.user,
    orders,
    activeTab: 'orders',
  });
});

// ─── GET /tai-khoan/lich-hen ──────────────────────────────────
export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await Booking.find({ user: req.user!._id })
    .sort({ bookingDate: -1 })
    .lean();

  res.render('client/profile', {
    title: 'Lịch hẹn của tôi - PurePaw',
    user: req.user,
    bookings,
    activeTab: 'bookings',
  });
});

// ─── GET /tai-khoan/don-hang/:id ──────────────────────────────
export const getOrderDetail = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user!._id,
  }).populate('items.product').lean();

  if (!order) {
    req.flash('error', 'Không tìm thấy đơn hàng');
    return res.redirect('/tai-khoan/don-hang');
  }

  res.render('client/order-detail', {
    title: `Đơn hàng #${(order as any).orderCode} - PurePaw`,
    order,
    currentPath: '/tai-khoan/don-hang',
  });
});

// ─── POST /tai-khoan/don-hang/:id/huy ─────────────────────────
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user!._id,
    status: 'pending',
  });

  if (!order) {
    req.flash('error', 'Không thể hủy đơn hàng này');
    return res.redirect('/tai-khoan/don-hang');
  }

  order.status = 'cancelled' as any;
  await order.save();

  req.flash('success', 'Đã hủy đơn hàng thành công!');
  res.redirect('/tai-khoan/don-hang');
});
