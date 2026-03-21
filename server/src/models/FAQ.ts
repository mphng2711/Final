import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// FAQ MODEL - Câu hỏi thường gặp
// Admin: Tạo, sửa, xóa FAQ
// User: Xem FAQ
// ============================================================

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: 'general' | 'order' | 'payment' | 'shipping' | 'booking' | 'product' | 'other';
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: [true, 'Câu hỏi là bắt buộc'],
      trim: true,
      maxlength: [500, 'Câu hỏi không vượt quá 500 ký tự'],
    },
    answer: {
      type: String,
      required: [true, 'Câu trả lời là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['general', 'order', 'payment', 'shipping', 'booking', 'product', 'other'],
        message: 'Danh mục FAQ không hợp lệ',
      },
      required: [true, 'Danh mục FAQ là bắt buộc'],
      default: 'general',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FAQSchema.index({ category: 1, sortOrder: 1 });
FAQSchema.index({ isActive: 1 });

const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
export default FAQ;
