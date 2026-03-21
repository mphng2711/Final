import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../../models/Product';
import Category from '../../models/Category';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import { toPublicPath, deleteUploadedFile } from '../../middlewares/upload.middleware';

// ============================================================
// ADMIN PRODUCT CONTROLLER - CRUD Sản phẩm (có upload ảnh)
// ============================================================

// ─── GET /admin/san-pham ──────────────────────────────────────
export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.search) filter.$text = { $search: req.query.search as string };

  const [products, total, categories] = await Promise.all([
    Product.find(filter).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find({ isActive: true }).lean(),
  ]);

  res.render('admin/products/index', {
    title: 'Quản lý sản phẩm - Admin',
    products, categories, total,
    page, totalPages: Math.ceil(total / limit),
    query: req.query,
  });
});

// ─── GET /admin/san-pham/them-moi ─────────────────────────────
export const getCreateProduct = catchAsync(async (req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).lean();
  res.render('admin/products/form', {
    title: 'Thêm sản phẩm mới - Admin',
    product: null,
    categories,
  });
});

// ─── POST /admin/san-pham (có upload ảnh) ─────────────────────
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const { name, description, shortDescription, category, brand, petType, tags, isActive, isFeatured } = req.body;
  const variants = parseVariantsFromBody(req.body);

  const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
  const existingSlug = await Product.findOne({ slug });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  // Xử lý files upload
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  let thumbnailPath = '/assets/placeholder.png';
  let imagePaths: string[] = [];

  if (files?.thumbnail?.[0]) {
    thumbnailPath = toPublicPath(files.thumbnail[0].path);
  } else if ((req as any).file) {
    // Trường hợp dùng .single()
    thumbnailPath = toPublicPath((req as any).file.path);
  }

  if (files?.images) {
    imagePaths = files.images.map(f => toPublicPath(f.path));
  }

  await Product.create({
    name: name.trim(),
    slug: finalSlug,
    description,
    shortDescription,
    category,
    brand,
    petType: petType || undefined,
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    variants,
    thumbnail: thumbnailPath,
    images: imagePaths,
    isActive: isActive === 'on',
    isFeatured: isFeatured === 'on',
  });

  req.flash('success', 'Thêm sản phẩm thành công!');
  res.redirect('/admin/san-pham');
});

// ─── GET /admin/san-pham/:id/sua ──────────────────────────────
export const getEditProduct = catchAsync(async (req: Request, res: Response) => {
  const [product, categories] = await Promise.all([
    Product.findById(req.params.id).lean(),
    Category.find({ isActive: true }).lean(),
  ]);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  res.render('admin/products/form', {
    title: 'Sửa sản phẩm - Admin',
    product,
    categories,
  });
});

// ─── PUT /admin/san-pham/:id (có upload ảnh) ──────────────────
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { name, description, shortDescription, category, brand, petType, tags, isActive, isFeatured, keepImages } = req.body;
  const variants = parseVariantsFromBody(req.body);

  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  // Cập nhật slug nếu tên thay đổi
  let slug = product.slug;
  if (name && name.trim() !== product.name) {
    slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    const existingSlug = await Product.findOne({ slug, _id: { $ne: product._id } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;
  }

  // Xử lý upload ảnh mới
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  let thumbnailPath = product.thumbnail; // giữ ảnh cũ mặc định
  if (files?.thumbnail?.[0]) {
    // Xóa ảnh cũ nếu có ảnh mới
    deleteUploadedFile(product.thumbnail);
    thumbnailPath = toPublicPath(files.thumbnail[0].path);
  }

  // Xử lý gallery images
  let imagePaths: string[] = product.images || [];
  if (files?.images && files.images.length > 0) {
    const newImages = files.images.map(f => toPublicPath(f.path));
    imagePaths = [...imagePaths, ...newImages];
  }

  // Xóa ảnh gallery được tick remove
  if (keepImages) {
    const keepList: string[] = Array.isArray(keepImages) ? keepImages : [keepImages];
    const toDelete = imagePaths.filter(img => !keepList.includes(img));
    toDelete.forEach(img => deleteUploadedFile(img));
    imagePaths = keepList;
  }

  await Product.findByIdAndUpdate(req.params.id, {
    name: name.trim(),
    slug,
    description,
    shortDescription,
    category,
    brand,
    petType: petType || undefined,
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    variants,
    thumbnail: thumbnailPath,
    images: imagePaths,
    isActive: isActive === 'on',
    isFeatured: isFeatured === 'on',
  });

  req.flash('success', 'Cập nhật sản phẩm thành công!');
  res.redirect('/admin/san-pham');
});

// ─── DELETE /admin/san-pham/:id ───────────────────────────────
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  // Xóa toàn bộ ảnh liên quan
  deleteUploadedFile(product.thumbnail);
  (product.images || []).forEach(img => deleteUploadedFile(img));

  req.flash('success', 'Đã xoá sản phẩm thành công!');
  res.redirect('/admin/san-pham');
});

// ─── PATCH /admin/san-pham/:id/toggle ────────────────────────
export const toggleProductStatus = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

  product.isActive = !product.isActive;
  await product.save();

  req.flash('success', `Sản phẩm đã được ${product.isActive ? 'kích hoạt' : 'ẩn'}`);
  res.redirect('/admin/san-pham');
});

// ─── HELPER: Parse variants từ form body ─────────────────────
function parseVariantsFromBody(body: any) {
  const variants: any[] = [];
  let i = 0;
  while (body[`variants[${i}][name]`] !== undefined) {
    variants.push({
      name: body[`variants[${i}][name]`],
      price: parseFloat(body[`variants[${i}][price]`]) || 0,
      salePrice: body[`variants[${i}][salePrice]`] ? parseFloat(body[`variants[${i}][salePrice]`]) : undefined,
      sku: body[`variants[${i}][sku]`] || `SKU-${Date.now()}-${i}`,
      stock: parseInt(body[`variants[${i}][stock]`]) || 0,
    });
    i++;
  }
  // Fallback: 1 variant đơn giản
  if (variants.length === 0 && body.variantName) {
    variants.push({
      name: body.variantName,
      price: parseFloat(body.variantPrice) || 0,
      salePrice: body.variantSalePrice ? parseFloat(body.variantSalePrice) : undefined,
      sku: body.variantSku || `SKU-${Date.now()}`,
      stock: parseInt(body.variantStock) || 0,
    });
  }
  return variants;
}
