import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// REVIEW CONTROLLER - Đánh giá sản phẩm
// ============================================================

// ─── POST /san-pham/:slug/danh-gia ───────────────────────────
export const submitProductReview = catchAsync(async (req: Request, res: Response) => {
  const { rating, title, comment } = req.body;
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true });
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  // Kiểm tra user đã mua sản phẩm này chưa
  const hasPurchased = await Order.findOne({
    user: req.user!._id,
    'items.product': product._id,
    status: 'delivered',
  });
  if (!hasPurchased) {
    req.flash('error', 'Bạn cần mua và nhận hàng thành công mới có thể đánh giá sản phẩm này');
    return res.redirect(`/san-pham/${slug}`);
  }

  // Kiểm tra đã review chưa
  const existing = await Review.findOne({ user: req.user!._id, product: product._id });
  if (existing) {
    req.flash('error', 'Bạn đã đánh giá sản phẩm này rồi');
    return res.redirect(`/san-pham/${slug}`);
  }

  const ratingNum = parseInt(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    req.flash('error', 'Vui lòng chọn số sao đánh giá (1-5)');
    return res.redirect(`/san-pham/${slug}`);
  }

  if (!comment?.trim()) {
    req.flash('error', 'Vui lòng nhập nội dung đánh giá');
    return res.redirect(`/san-pham/${slug}`);
  }

  await Review.create({
    user: req.user!._id,
    product: product._id,
    reviewType: 'product',
    rating: ratingNum,
    title: title?.trim(),
    comment: comment.trim(),
    isApproved: true,
  });

  // Cập nhật averageRating & totalReviews của Product
  const stats = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(product._id, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }

  req.flash('success', 'Cảm ơn bạn đã đánh giá sản phẩm! ⭐');
  res.redirect(`/san-pham/${slug}`);
});
