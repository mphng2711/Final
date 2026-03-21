import { Request, Response } from 'express';
import slugify from 'slugify';
import Category from '../../models/Category';
import Product from '../../models/Product';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN CATEGORY CONTROLLER - CRUD Danh mục
// ============================================================

// ─── GET /admin/danh-muc ─────────────────────────────────────
export const listCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await Category.find()
    .populate('parentCategory', 'name')
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  // Đếm số sản phẩm cho mỗi danh mục
  const productCounts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  productCounts.forEach((c: any) => { countMap[c._id?.toString()] = c.count; });

  // Tính số sản phẩm mồ côi (category không còn tồn tại)
  const allCategoryIds = categories.map((c: any) => c._id);
  const orphanCount = await Product.countDocuments({
    category: { $nin: allCategoryIds },
  });

  res.render('admin/categories/index', {
    title: 'Quản lý danh mục - Admin',
    categories,
    countMap,
    orphanCount,
  });
});

// ─── POST /admin/danh-muc/fix-orphans ─────────────────────────
// Migration: chuyển sản phẩm mồ côi về danh mục đầu tiên
export const fixOrphanedProducts = catchAsync(async (req: Request, res: Response) => {
  const { targetCategoryId } = req.body;

  const targetCategory = await Category.findById(targetCategoryId);
  if (!targetCategory) throw new AppError('Danh mục đích không tồn tại', 404);

  const allCategories = await Category.find().select('_id');
  const allCategoryIds = allCategories.map((c: any) => c._id);

  const result = await Product.updateMany(
    { category: { $nin: allCategoryIds } },
    { $set: { category: targetCategoryId } }
  );

  req.flash('success', `✅ Đã chuyển ${result.modifiedCount} sản phẩm mồ côi về danh mục "${targetCategory.name}"`);
  res.redirect('/admin/danh-muc');
});

// ─── GET /admin/danh-muc/them-moi ────────────────────────────
export const getCreateCategory = catchAsync(async (req: Request, res: Response) => {
  const parentCategories = await Category.find({ parentCategory: null, isActive: true }).lean();
  res.render('admin/categories/form', {
    title: 'Thêm danh mục - Admin',
    category: null,
    parentCategories,
  });
});

// ─── POST /admin/danh-muc ────────────────────────────────────
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description, parentCategory, sortOrder, isActive } = req.body;

  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
  const existingSlug = await Category.findOne({ slug });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  await Category.create({
    name: name.trim(),
    slug: finalSlug,
    description: description?.trim(),
    parentCategory: parentCategory || null,
    sortOrder: parseInt(sortOrder) || 0,
    isActive: isActive === 'on',
  });

  req.flash('success', 'Thêm danh mục thành công!');
  res.redirect('/admin/danh-muc');
});

// ─── GET /admin/danh-muc/:id/sua ─────────────────────────────
export const getEditCategory = catchAsync(async (req: Request, res: Response) => {
  const [category, parentCategories] = await Promise.all([
    Category.findById(req.params.id).lean(),
    Category.find({ parentCategory: null, isActive: true, _id: { $ne: req.params.id } }).lean(),
  ]);

  if (!category) throw new AppError('Danh mục không tồn tại', 404);

  res.render('admin/categories/form', {
    title: 'Sửa danh mục - Admin',
    category,
    parentCategories,
  });
});

// ─── PUT /admin/danh-muc/:id ─────────────────────────────────
export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description, parentCategory, sortOrder, isActive } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Danh mục không tồn tại', 404);

  let slug = category.slug;
  if (name && name.trim() !== category.name) {
    slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    const existingSlug = await Category.findOne({ slug, _id: { $ne: category._id } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;
  }

  await Category.findByIdAndUpdate(req.params.id, {
    name: name.trim(),
    slug,
    description: description?.trim(),
    parentCategory: parentCategory || null,
    sortOrder: parseInt(sortOrder) || 0,
    isActive: isActive === 'on',
  });

  req.flash('success', 'Cập nhật danh mục thành công!');
  res.redirect('/admin/danh-muc');
});

// ─── DELETE /admin/danh-muc/:id ──────────────────────────────
export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  // Kiểm tra xem có sản phẩm nào đang dùng danh mục này không
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    req.flash('error', `Không thể xóa danh mục này vì đang có ${productCount} sản phẩm thuộc danh mục. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.`);
    return res.redirect('/admin/danh-muc');
  }

  await Category.findByIdAndDelete(req.params.id);
  req.flash('success', 'Đã xoá danh mục!');
  res.redirect('/admin/danh-muc');
});
