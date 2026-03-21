import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// PAYMENT MODEL - Thanh toán
// Liên kết tới Order hoặc Booking
// ============================================================

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  paymentType: 'order' | 'booking';
  method: 'cod' | 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  amount: number;
  transactionId?: string;          // Mã giao dịch từ cổng thanh toán
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    paymentType: {
      type: String,
      enum: {
        values: ['order', 'booking'],
        message: 'Loại thanh toán phải là "order" hoặc "booking"',
      },
      required: [true, 'Loại thanh toán là bắt buộc'],
    },
    method: {
      type: String,
      enum: {
        values: ['cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay'],
        message: 'Phương thức thanh toán không hợp lệ',
      },
      required: [true, 'Phương thức thanh toán là bắt buộc'],
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền thanh toán là bắt buộc'],
      min: [0, 'Số tiền không được âm'],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Trạng thái thanh toán không hợp lệ',
      },
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      maxlength: [300, 'Ghi chú không vượt quá 300 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Validate: Phải có order hoặc booking
PaymentSchema.pre('validate', function (next) {
  if (!this.order && !this.booking) {
    this.invalidate('order', 'Thanh toán phải liên kết với đơn hàng hoặc booking');
  }
  if (this.order && this.booking) {
    this.invalidate('order', 'Thanh toán chỉ có thể liên kết với đơn hàng HOẶC booking, không phải cả hai');
  }
  next();
});

// Indexes
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
