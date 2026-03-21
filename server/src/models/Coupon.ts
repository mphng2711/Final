import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// COUPON MODEL - Mã giảm giá / Khuyến mãi
// Admin tạo, User áp dụng khi thanh toán
// ============================================================

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;        // % hoặc số tiền cố định (VND)
  minOrderAmount?: number;      // Giá trị đơn hàng tối thiểu
  maxDiscountAmount?: number;   // Giới hạn số tiền giảm tối đa (cho %)
  usageLimit: number;           // Tổng số lần sử dụng tối đa
  usedCount: number;            // Số lần đã sử dụng
  usageLimitPerUser: number;    // Giới hạn sử dụng / user
  applicableTo: 'all' | 'product' | 'booking';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Mã coupon là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [30, 'Mã coupon không vượt quá 30 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Mô tả không vượt quá 300 ký tự'],
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed_amount'],
        message: 'Loại giảm giá phải là "percentage" hoặc "fixed_amount"',
      },
      required: [true, 'Loại giảm giá là bắt buộc'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm giá là bắt buộc'],
      min: [0, 'Giá trị giảm giá không được âm'],
      validate: {
        validator: function (this: ICoupon, val: number) {
          if (this.discountType === 'percentage') {
            return val > 0 && val <= 100;
          }
          return val > 0;
        },
        message: 'Giá trị giảm giá không hợp lệ (phần trăm: 1-100)',
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Giá trị đơn tối thiểu không được âm'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Giới hạn giảm giá không được âm'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Giới hạn sử dụng là bắt buộc'],
      min: [1, 'Giới hạn sử dụng phải ít nhất là 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: [1, 'Giới hạn mỗi user ít nhất 1'],
    },
    applicableTo: {
      type: String,
      enum: {
        values: ['all', 'product', 'booking'],
        message: 'Phạm vi áp dụng phải là "all", "product" hoặc "booking"',
      },
      default: 'all',
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
      validate: {
        validator: function (this: ICoupon, val: Date) {
          return val > this.startDate;
        },
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
      },
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

// Virtual: Kiểm tra coupon còn hiệu lực
CouponSchema.virtual('isValid').get(function (this: ICoupon) {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    this.usedCount < this.usageLimit
  );
});

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });
CouponSchema.index({ isActive: 1 });

const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
