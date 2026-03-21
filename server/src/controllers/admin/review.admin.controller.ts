import { Request, Response } from 'express';
import Review from '../../models/Review';
import Product from '../../models/Product';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN REVIEW CONTROLLER - Quản lý đánh giá
// ============================================================

// ─── GET /admin/danh-gia ──────────────────────────────────────
export const listReviews = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status === 'approved') filter.isApproved = true;
  if (req.query.status === 'pending') filter.isApproved = false;
  if (req.query.type) filter.reviewType = req.query.type;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.render('admin/reviews/index', {
    title: 'Quản lý đánh giá - Admin',
    reviews, total, page,
    totalPages: Math.ceil(total / limit),
    query: req.query,
  });
});

// ─── PATCH /admin/danh-gia/:id/duyet ────────────────────────
export const approveReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Đánh giá không tồn tại', 404);

  review.isApproved = !review.isApproved;
  await review.save();

  // Cập nhật lại rating trung bình của Product nếu là product review
  if (review.product) {
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
      totalReviews: stats.length ? stats[0].count : 0,
    });
  }

  req.flash('success', `Đánh giá đã được ${review.isApproved ? 'duyệt' : 'ẩn'}`);
  res.redirect('/admin/danh-gia');
});

// ─── POST /admin/danh-gia/:id/phan-hoi ──────────────────────
export const replyReview = catchAsync(async (req: Request, res: Response) => {
  const { adminReply } = req.body;

  await Review.findByIdAndUpdate(req.params.id, {
    adminReply: adminReply?.trim(),
  });

  req.flash('success', 'Đã cập nhật phản hồi');
  res.redirect('/admin/danh-gia');
});

// ─── DELETE /admin/danh-gia/:id ──────────────────────────────
export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError('Đánh giá không tồn tại', 404);

  req.flash('success', 'Đã xóa đánh giá!');
  res.redirect('/admin/danh-gia');
});
