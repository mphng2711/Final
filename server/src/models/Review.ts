import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// REVIEW MODEL - Đánh giá sản phẩm / dịch vụ
// Liên kết: User → Review → Product (hoặc Booking)
// ============================================================

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  reviewType: 'product' | 'service';
  rating: number;                     // 1 → 5 sao
  title?: string;
  comment: string;
  images?: string[];                  // Ảnh kèm đánh giá
  isApproved: boolean;                // Admin duyệt
  adminReply?: string;                // Admin phản hồi
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    reviewType: {
      type: String,
      enum: {
        values: ['product', 'service'],
        message: 'Loại review phải là "product" hoặc "service"',
      },
      required: [true, 'Loại review là bắt buộc'],
    },
    rating: {
      type: Number,
      required: [true, 'Số sao đánh giá là bắt buộc'],
      min: [1, 'Đánh giá tối thiểu 1 sao'],
      max: [5, 'Đánh giá tối đa 5 sao'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Tiêu đề không vượt quá 200 ký tự'],
    },
    comment: {
      type: String,
      required: [true, 'Nội dung đánh giá là bắt buộc'],
      trim: true,
      maxlength: [1000, 'Nội dung đánh giá không vượt quá 1000 ký tự'],
    },
    images: {
      type: [String],
      validate: {
        validator: (val: string[]) => val.length <= 5,
        message: 'Tối đa 5 ảnh cho mỗi đánh giá',
      },
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    adminReply: {
      type: String,
      trim: true,
      maxlength: [500, 'Phản hồi Admin không vượt quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Validate: Phải có product hoặc booking
ReviewSchema.pre('validate', function (next) {
  if (!this.product && !this.booking) {
    this.invalidate('product', 'Review phải liên kết với sản phẩm hoặc dịch vụ');
  }
  next();
});

// Mỗi user chỉ review 1 lần cho mỗi product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, booking: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ product: 1, isApproved: 1 });
ReviewSchema.index({ rating: 1 });

const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
