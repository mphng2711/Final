import { Request, Response } from 'express';
import Blog from '../../models/Blog';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import slugify from 'slugify';

// ============================================================
// ADMIN BLOG CONTROLLER - Quản lý bài viết / tin tức
// ============================================================

const BLOG_CATEGORIES = ['news', 'tips', 'health', 'grooming', 'nutrition', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  news: 'Tin tức', tips: 'Mẹo hay', health: 'Sức khỏe',
  grooming: 'Grooming', nutrition: 'Dinh dưỡng', other: 'Khác',
};

// ─── GET /admin/bai-viet ──────────────────────────────────────
export const listBlogs = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === 'published') filter.isPublished = true;
  if (req.query.status === 'draft') filter.isPublished = false;

  const [blogs, total] = await Promise.all([
    Blog.find(filter).populate('author', 'fullName').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  res.render('admin/blogs/index', {
    title: 'Quản lý bài viết - Admin',
    blogs, total, page,
    totalPages: Math.ceil(total / limit),
    categories: BLOG_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
    query: req.query,
  });
});

// ─── GET /admin/bai-viet/them-moi ────────────────────────────
export const getCreateBlog = (req: Request, res: Response) => {
  res.render('admin/blogs/form', {
    title: 'Thêm bài viết - Admin',
    blog: null,
    categories: BLOG_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
  });
};

// ─── POST /admin/bai-viet ─────────────────────────────────────
export const createBlog = catchAsync(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, tags, thumbnail, isPublished } = req.body;

  const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
  const existingSlug = await Blog.findOne({ slug });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  await Blog.create({
    title: title.trim(),
    slug: finalSlug,
    content,
    excerpt: excerpt?.trim(),
    thumbnail: thumbnail?.trim() || '/assets/blog-placeholder.png',
    author: req.user!._id,
    category,
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    isPublished: isPublished === 'on',
  });

  req.flash('success', 'Đã tạo bài viết thành công!');
  res.redirect('/admin/bai-viet');
});

// ─── GET /admin/bai-viet/:id/sua ────────────────────────────
export const getEditBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id).lean();
  if (!blog) throw new AppError('Bài viết không tồn tại', 404);

  res.render('admin/blogs/form', {
    title: 'Sửa bài viết - Admin',
    blog,
    categories: BLOG_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
  });
});

// ─── PUT /admin/bai-viet/:id ─────────────────────────────────
export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, tags, thumbnail, isPublished } = req.body;

  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new AppError('Bài viết không tồn tại', 404);

  let slug = blog.slug;
  if (title && title.trim() !== blog.title) {
    slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
    const existing = await Blog.findOne({ slug, _id: { $ne: blog._id } });
    if (existing) slug = `${slug}-${Date.now()}`;
  }

  await Blog.findByIdAndUpdate(req.params.id, {
    title: title.trim(),
    slug,
    content,
    excerpt: excerpt?.trim(),
    thumbnail: thumbnail?.trim() || blog.thumbnail,
    category,
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    isPublished: isPublished === 'on',
  });

  req.flash('success', 'Cập nhật bài viết thành công!');
  res.redirect('/admin/bai-viet');
});

// ─── DELETE /admin/bai-viet/:id ──────────────────────────────
export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new AppError('Bài viết không tồn tại', 404);

  req.flash('success', 'Đã xóa bài viết!');
  res.redirect('/admin/bai-viet');
});
