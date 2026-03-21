import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Review from '../models/Review';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// PRODUCT CONTROLLER - Danh sách & Chi tiết sản phẩm
// ============================================================

// ─── GET /san-pham ────────────────────────────────────────────
export const getProductsPage = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build query filter
  const filter: any = { isActive: true };

  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category });
    if (cat) filter.category = cat._id;
  }

  if (req.query.petType && ['dog', 'cat', 'other'].includes(req.query.petType as string)) {
    filter.petType = req.query.petType;
  }

  // Tìm kiếm full-text
  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  // Sort
  let sortOption: any = { createdAt: -1 };
  if (req.query.sort === 'price-asc') sortOption = { 'variants.0.price': 1 };
  if (req.query.sort === 'price-desc') sortOption = { 'variants.0.price': -1 };
  if (req.query.sort === 'popular') sortOption = { totalSold: -1 };
  if (req.query.sort === 'rating') sortOption = { averageRating: -1 };

  const [products, total, categories] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.render('client/products', {
    title: 'Sản phẩm - PurePaw Pet House',
    products,
    categories,
    total,
    page,
    totalPages,
    query: req.query,
  });
});

// ─── GET /san-pham/:slug ──────────────────────────────────────
export const getProductDetailPage = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .lean();

  if (!product) {
    req.flash('error', 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
    return res.redirect('/san-pham');
  }

  // Lấy reviews của sản phẩm
  const reviews = await Review.find({ product: (product as any)._id, isApproved: true })
    .populate('user', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Sản phẩm liên quan (cùng category)
  const relatedProducts = await Product.find({
    category: (product as any).category,
    isActive: true,
    _id: { $ne: (product as any)._id },
  }).limit(4).lean();

  res.render('client/product-detail', {
    title: `${product.name} - PurePaw`,
    product,
    reviews,
    relatedProducts,
  });
});
