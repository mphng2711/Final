import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// BOOKING MODEL - Đặt lịch dịch vụ Spa thú cưng
// Actors: User (Tạo/Xem/Cập nhật/Hủy), Admin (Quản lý lịch)
// ============================================================

export interface IPetInfo {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  weight?: number;            // kg
  age?: number;               // tháng tuổi
  note?: string;              // Ghi chú đặc biệt
}

export interface IBooking extends Document {
  bookingCode: string;
  user: mongoose.Types.ObjectId;
  pet: IPetInfo;
  service: string;             // Tên dịch vụ: "Tắm", "Cắt tỉa lông", "Combo Spa"...
  serviceType: 'bath' | 'grooming' | 'combo' | 'health_check' | 'other';
  bookingDate: Date;           // Ngày hẹn
  timeSlot: string;            // Khung giờ: "09:00 - 10:00"
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  cancelReason?: string;
  adminNote?: string;          // Ghi chú từ Admin
  createdAt: Date;
  updatedAt: Date;
}

const PetInfoSchema = new Schema<IPetInfo>(
  {
    name: {
      type: String,
      required: [true, 'Tên thú cưng là bắt buộc'],
      trim: true,
    },
    species: {
      type: String,
      enum: {
        values: ['dog', 'cat', 'other'],
        message: 'Loài thú cưng phải là "dog", "cat" hoặc "other"',
      },
      required: [true, 'Loài thú cưng là bắt buộc'],
    },
    breed: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: [0.1, 'Cân nặng phải lớn hơn 0'],
    },
    age: {
      type: Number,
      min: [0, 'Tuổi không được âm'],
    },
    note: {
      type: String,
      maxlength: [300, 'Ghi chú không vượt quá 300 ký tự'],
    },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      unique: true,
      sparse: true,  // cho phép null/undefined trước khi hook set giá trị
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User là bắt buộc'],
    },
    pet: {
      type: PetInfoSchema,
      required: [true, 'Thông tin thú cưng là bắt buộc'],
    },
    service: {
      type: String,
      required: [true, 'Tên dịch vụ là bắt buộc'],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: {
        values: ['bath', 'grooming', 'combo', 'health_check', 'other'],
        message: 'Loại dịch vụ không hợp lệ',
      },
      required: [true, 'Loại dịch vụ là bắt buộc'],
    },
    bookingDate: {
      type: Date,
      required: [true, 'Ngày đặt lịch là bắt buộc'],
      validate: {
        validator: (val: Date) => val > new Date(),
        message: 'Ngày đặt lịch phải là ngày trong tương lai',
      },
    },
    timeSlot: {
      type: String,
      required: [true, 'Khung giờ là bắt buộc'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá dịch vụ là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
        message: 'Trạng thái booking không hợp lệ',
      },
      default: 'pending',
    },
    cancelReason: {
      type: String,
      maxlength: [500, 'Lý do hủy không vượt quá 500 ký tự'],
    },
    adminNote: {
      type: String,
      maxlength: [500, 'Ghi chú Admin không vượt quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate bookingCode
BookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingCode) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingCode = `BK-${datePart}-${randomPart}`;
  }
  next();
});

// Indexes
BookingSchema.index({ user: 1, bookingDate: -1 });
BookingSchema.index({ bookingDate: 1, timeSlot: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingCode: 1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
