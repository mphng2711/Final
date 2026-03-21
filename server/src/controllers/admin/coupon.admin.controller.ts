import { Request, Response } from 'express';
import Coupon from '../../models/Coupon';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN COUPON CONTROLLER - Quản lý mã giảm giá
// ============================================================

// ─── GET /admin/coupon ────────────────────────────────────────
export const listCoupons = catchAsync(async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).lean();
  const now = new Date();

  res.render('admin/coupons/index', {
    title: 'Quản lý mã giảm giá - Admin',
    coupons,
    now,
    query: req.query,
  });
});

// ─── GET /admin/coupon/them-moi ───────────────────────────────
export const getCreateCoupon = (req: Request, res: Response) => {
  res.render('admin/coupons/form', {
    title: 'Thêm mã giảm giá - Admin',
    coupon: null,
  });
};

// ─── POST /admin/coupon ───────────────────────────────────────
export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const {
    code, description, discountType, discountValue,
    minOrderAmount, maxDiscountAmount, usageLimit,
    usageLimitPerUser, applicableTo, startDate, endDate, isActive,
  } = req.body;

  await Coupon.create({
    code: code.toUpperCase().trim(),
    description: description?.trim(),
    discountType,
    discountValue: parseFloat(discountValue),
    minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    usageLimit: parseInt(usageLimit),
    usageLimitPerUser: parseInt(usageLimitPerUser) || 1,
    applicableTo: applicableTo || 'all',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActive: isActive === 'on',
  });

  req.flash('success', `Đã tạo mã giảm giá "${code.toUpperCase()}" thành công!`);
  res.redirect('/admin/coupon');
});

// ─── GET /admin/coupon/:id/sua ────────────────────────────────
export const getEditCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id).lean();
  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);

  res.render('admin/coupons/form', {
    title: 'Sửa mã giảm giá - Admin',
    coupon,
  });
});

// ─── PUT /admin/coupon/:id ────────────────────────────────────
export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const {
    description, discountType, discountValue,
    minOrderAmount, maxDiscountAmount, usageLimit,
    usageLimitPerUser, applicableTo, startDate, endDate, isActive,
  } = req.body;

  await Coupon.findByIdAndUpdate(req.params.id, {
    description: description?.trim(),
    discountType,
    discountValue: parseFloat(discountValue),
    minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    usageLimit: parseInt(usageLimit),
    usageLimitPerUser: parseInt(usageLimitPerUser) || 1,
    applicableTo: applicableTo || 'all',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActive: isActive === 'on',
  });

  req.flash('success', 'Cập nhật mã giảm giá thành công!');
  res.redirect('/admin/coupon');
});

// ─── DELETE /admin/coupon/:id ─────────────────────────────────
export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);

  req.flash('success', 'Đã xóa mã giảm giá!');
  res.redirect('/admin/coupon');
});

// ─── PATCH /admin/coupon/:id/toggle ──────────────────────────
export const toggleCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  req.flash('success', `Mã giảm giá đã được ${coupon.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
  res.redirect('/admin/coupon');
});
