import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import catchAsync from '../utils/catchAsync';

// ============================================================
// HOME CONTROLLER - Trang chủ, Giới thiệu, Liên hệ
// ============================================================

// ─── GET / ────────────────────────────────────────────────────
export const getHomePage = catchAsync(async (req: Request, res: Response) => {
  // Lấy sản phẩm nổi bật (isFeatured = true, isActive = true)
  const featuredProducts = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .sort({ totalSold: -1 })
    .limit(8)
    .lean();

  // Lấy danh mục đang hoạt động
  const categories = await Category.find({ isActive: true, parentCategory: null })
    .sort({ sortOrder: 1 })
    .limit(6)
    .lean();

  // Sản phẩm mới nhất
  const newProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  res.render('client/index', {
    title: 'Trang chủ - PurePaw Pet Shop',
    featuredProducts,
    categories,
    newProducts,
    currentPath: '/',
  });
});

// ─── GET /gioi-thieu ──────────────────────────────────────────
export const getAboutPage = (req: Request, res: Response) => {
  res.render('client/about', {
    title: 'Giới thiệu - PurePaw Pet Shop',
    currentPath: '/gioi-thieu',
  });
};

// ─── GET /lien-he ─────────────────────────────────────────────
export const getContactPage = (req: Request, res: Response) => {
  res.render('client/contact', {
    title: 'Liên hệ - PurePaw Pet Shop',
    currentPath: '/lien-he',
  });
};

// ─── POST /lien-he ────────────────────────────────────────────
export const submitContact = (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  // TODO: Gửi email hoặc lưu vào DB
  req.flash('success', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể 🐾');
  res.redirect('/lien-he');
};

// ─── GET /chinh-sach ──────────────────────────────────────────
export const getPoliciesPage = (req: Request, res: Response) => {
  res.render('client/policies', {
    title: 'Chính sách & Điều khoản - PurePaw Pet Shop',
    currentPath: '/chinh-sach',
  });
};
