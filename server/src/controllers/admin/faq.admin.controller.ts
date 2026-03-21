import { Request, Response } from 'express';
import FAQ from '../../models/FAQ';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN FAQ CONTROLLER - Quản lý câu hỏi thường gặp
// ============================================================

const FAQ_CATEGORIES = ['general', 'order', 'payment', 'shipping', 'booking', 'product', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Chung', order: 'Đơn hàng', payment: 'Thanh toán',
  shipping: 'Giao hàng', booking: 'Lịch hẹn spa', product: 'Sản phẩm', other: 'Khác',
};

// ─── GET /admin/faq ───────────────────────────────────────────
export const listFAQs = catchAsync(async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.category) filter.category = req.query.category;

  const faqs = await FAQ.find(filter).sort({ category: 1, sortOrder: 1 }).lean();

  res.render('admin/faqs/index', {
    title: 'Quản lý FAQ - Admin',
    faqs,
    categories: FAQ_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
    query: req.query,
  });
});

// ─── GET /admin/faq/them-moi ──────────────────────────────────
export const getCreateFAQ = (req: Request, res: Response) => {
  res.render('admin/faqs/form', {
    title: 'Thêm FAQ - Admin',
    faq: null,
    categories: FAQ_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
  });
};

// ─── POST /admin/faq ──────────────────────────────────────────
export const createFAQ = catchAsync(async (req: Request, res: Response) => {
  const { question, answer, category, sortOrder, isActive } = req.body;

  await FAQ.create({
    question: question.trim(),
    answer: answer.trim(),
    category: category || 'general',
    sortOrder: parseInt(sortOrder) || 0,
    isActive: isActive === 'on',
  });

  req.flash('success', 'Đã thêm câu hỏi thành công!');
  res.redirect('/admin/faq');
});

// ─── GET /admin/faq/:id/sua ───────────────────────────────────
export const getEditFAQ = catchAsync(async (req: Request, res: Response) => {
  const faq = await FAQ.findById(req.params.id).lean();
  if (!faq) throw new AppError('FAQ không tồn tại', 404);

  res.render('admin/faqs/form', {
    title: 'Sửa FAQ - Admin',
    faq,
    categories: FAQ_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
  });
});

// ─── PUT /admin/faq/:id ───────────────────────────────────────
export const updateFAQ = catchAsync(async (req: Request, res: Response) => {
  const { question, answer, category, sortOrder, isActive } = req.body;

  await FAQ.findByIdAndUpdate(req.params.id, {
    question: question.trim(),
    answer: answer.trim(),
    category: category || 'general',
    sortOrder: parseInt(sortOrder) || 0,
    isActive: isActive === 'on',
  });

  req.flash('success', 'Cập nhật FAQ thành công!');
  res.redirect('/admin/faq');
});

// ─── DELETE /admin/faq/:id ────────────────────────────────────
export const deleteFAQ = catchAsync(async (req: Request, res: Response) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) throw new AppError('FAQ không tồn tại', 404);

  req.flash('success', 'Đã xóa câu hỏi!');
  res.redirect('/admin/faq');
});
