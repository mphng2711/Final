import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// ORDER MODEL - Đơn hàng mua sản phẩm
// Liên kết: User → Order → Product (nhiều sản phẩm)
// Liên kết: Order → Payment
// ============================================================

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;            // Snapshot tên SP tại thời điểm mua
  variant: mongoose.Types.ObjectId;
  variantName: string;            // Snapshot tên biến thể
  quantity: number;
  price: number;                  // Đơn giá tại thời điểm mua
  subtotal: number;               // price * quantity
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface IOrder extends Document {
  orderCode: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  coupon?: mongoose.Types.ObjectId;
  subtotal: number;               // Tổng tiền hàng
  discountAmount: number;         // Số tiền giảm giá
  shippingFee: number;
  totalAmount: number;            // subtotal - discountAmount + shippingFee
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  note?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    variantName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải ít nhất là 1'],
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: {
      type: String,
      unique: true,
      sparse: true,  // cho phép null/undefined trước khi pre-save hook set giá trị
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: (val: IOrderItem[]) => val.length >= 1,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: [true, 'Địa chỉ giao hàng là bắt buộc'],
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'],
        message: 'Trạng thái đơn hàng không hợp lệ',
      },
      default: 'pending',
    },
    note: {
      type: String,
      maxlength: [500, 'Ghi chú không vượt quá 500 ký tự'],
    },
    cancelReason: {
      type: String,
      maxlength: [500, 'Lý do hủy không vượt quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderCode trước khi lưu
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderCode) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderCode = `PP-${datePart}-${randomPart}`;
  }
  next();
});

// Indexes
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderCode: 1 });
OrderSchema.index({ status: 1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
