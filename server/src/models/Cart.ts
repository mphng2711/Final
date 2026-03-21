import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// CART MODEL - Giỏ hàng
// Mỗi User có 1 Cart duy nhất (One-to-One)
// Hỗ trợ: Xem, cập nhật số lượng, xóa sản phẩm
// ============================================================

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;   // ID của variant trong Product
  quantity: number;
  price: number;                       // Giá tại thời điểm thêm vào giỏ
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Sản phẩm là bắt buộc'],
    },
    variant: {
      type: Schema.Types.ObjectId,
      required: [true, 'Biến thể sản phẩm là bắt buộc'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải ít nhất là 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
      unique: true, // Mỗi user chỉ có 1 giỏ hàng
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tổng tiền không được âm'],
    },
  },
  {
    timestamps: true,
  }
);

// Tính tổng tiền trước khi lưu
CartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

// Index
CartSchema.index({ user: 1 });

const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
