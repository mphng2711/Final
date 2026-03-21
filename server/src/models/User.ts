import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// USER MODEL - Tài khoản & Xác thực
// Actors: User (Khách hàng) | Admin (Quản trị viên)
// ============================================================

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  address?: IAddress;
  role: 'user' | 'admin';
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, trim: true },
    ward: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
      maxlength: [100, 'Họ và tên không được vượt quá 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false, // Không trả về password khi query
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ'],
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      type: AddressSchema,
      default: {},
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role phải là "user" hoặc "admin"',
      },
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index tối ưu tìm kiếm
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
