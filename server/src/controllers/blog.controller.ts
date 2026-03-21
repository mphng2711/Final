import { Request, Response } from 'express';
import Blog from '../models/Blog';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// BLOG CONTROLLER - Bài viết phía người dùng
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Tin tức', tips: 'Mẹo hay', health: 'Sức khỏe',
  grooming: 'Grooming', nutrition: 'Dinh dưỡng', other: 'Khác',
};

// ─── GET /tin-tuc ─────────────────────────────────────────────
export const getBlogsPage = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;

  const filter: any = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select('title slug excerpt thumbnail category publishedAt viewCount')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.render('client/blogs', {
    title: 'Tin tức & Mẹo hay - PurePaw',
    blogs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categoryLabels: CATEGORY_LABELS,
    query: req.query,
  });
});

// ─── GET /tin-tuc/:slug ───────────────────────────────────────
export const getBlogDetail = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('author', 'fullName').lean();

  if (!blog) throw new AppError('Bài viết không tồn tại', 404);

  // Bài viết liên quan (cùng category)
  const related = await Blog.find({
    isPublished: true,
    category: (blog as any).category,
    _id: { $ne: (blog as any)._id },
  })
    .select('title slug thumbnail publishedAt')
    .limit(3)
    .lean();

  res.render('client/blog-detail', {
    title: `${(blog as any).title} - PurePaw`,
    blog,
    related,
    categoryLabels: CATEGORY_LABELS,
  });
});
