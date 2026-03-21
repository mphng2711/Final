import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// BLOG MODEL - Bài viết / Tin tức
// Admin: Tạo, sửa, xóa bài viết
// User: Xem bài viết
// ============================================================

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;             // Đoạn trích ngắn
  thumbnail: string;
  images?: string[];
  author: mongoose.Types.ObjectId;
  category: 'news' | 'tips' | 'health' | 'grooming' | 'nutrition' | 'other';
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
      maxlength: [300, 'Tiêu đề không vượt quá 300 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bài viết là bắt buộc'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Đoạn trích không vượt quá 500 ký tự'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Ảnh đại diện bài viết là bắt buộc'],
    },
    images: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tác giả là bắt buộc'],
    },
    category: {
      type: String,
      enum: {
        values: ['news', 'tips', 'health', 'grooming', 'nutrition', 'other'],
        message: 'Danh mục bài viết không hợp lệ',
      },
      required: [true, 'Danh mục bài viết là bắt buộc'],
    },
    tags: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto set publishedAt khi publish
BlogSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Indexes
BlogSchema.index({ slug: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ title: 'text', tags: 'text' }); // Full-text search

const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
