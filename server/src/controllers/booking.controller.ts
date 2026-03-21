import { Request, Response } from 'express';
import Booking from '../models/Booking';
import catchAsync from '../utils/catchAsync';

// ============================================================
// BOOKING CONTROLLER - Grooming Spa & Đặt lịch
// ============================================================

// Danh sách dịch vụ và giá
const SERVICES = [
  { id: 'bath', name: 'Tắm & Sấy khô', type: 'bath', price: 150000 },
  { id: 'grooming', name: 'Cắt tỉa lông', type: 'grooming', price: 200000 },
  { id: 'combo', name: 'Combo Spa (Tắm + Cắt + Vệ sinh tai)', type: 'combo', price: 350000 },
  { id: 'health_check', name: 'Kiểm tra sức khỏe tổng quát', type: 'health_check', price: 250000 },
];

// Khung giờ hoạt động
const TIME_SLOTS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
];

// ─── GET /grooming ────────────────────────────────────────────
export const getGroomingPage = (req: Request, res: Response) => {
  res.render('client/grooming', {
    title: 'Dịch vụ Grooming Spa - PurePaw',
    services: SERVICES,
    timeSlots: TIME_SLOTS,
  });
};

// ─── POST /grooming/dat-lich ─────────────────────────────────
export const submitBooking = catchAsync(async (req: Request, res: Response) => {
  const { petName, petSpecies, petBreed, petWeight, serviceId, bookingDate, timeSlot, note } = req.body;

  // Tìm dịch vụ được chọn
  const selectedService = SERVICES.find(s => s.id === serviceId);
  if (!selectedService) {
    req.flash('error', 'Dịch vụ không hợp lệ');
    return res.redirect('/grooming');
  }

  // Kiểm tra ngày đặt phải trong tương lai
  const date = new Date(bookingDate);
  if (date <= new Date()) {
    req.flash('error', 'Ngày đặt lịch phải là ngày trong tương lai');
    return res.redirect('/grooming');
  }

  // Kiểm tra slot đó còn trống không (tối đa 3 booking cùng giờ)
  const existingCount = await Booking.countDocuments({
    bookingDate: date,
    timeSlot,
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
  });

  if (existingCount >= 3) {
    req.flash('error', 'Khung giờ này đã đầy, vui lòng chọn khung giờ khác');
    return res.redirect('/grooming');
  }

  // Tự sinh bookingCode ở controller để tránh lỗi validation trước pre-save hook
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingCode = `BK-${datePart}-${randomPart}`;

  await Booking.create({
    bookingCode,
    user: req.user!._id,
    pet: {
      name: petName,
      species: petSpecies,
      breed: petBreed,
      weight: petWeight ? parseFloat(petWeight) : undefined,
      note,
    },
    service: selectedService.name,
    serviceType: selectedService.type,
    bookingDate: date,
    timeSlot,
    price: selectedService.price,
  });

  req.flash('success', `Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận lịch hẹn của bạn 🐾`);
  res.redirect('/tai-khoan/lich-hen');
});
