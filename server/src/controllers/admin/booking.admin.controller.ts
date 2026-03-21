import { Request, Response } from 'express';
import Booking from '../../models/Booking';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN BOOKING CONTROLLER - Quản lý lịch hẹn Spa
// ============================================================

const BOOKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện', completed: 'Hoàn tất', cancelled: 'Đã hủy',
};

// ─── GET /admin/lich-hen ──────────────────────────────────────
export const listBookings = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;

  // Lọc theo ngày
  if (req.query.date) {
    const d = new Date(req.query.date as string);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.bookingDate = { $gte: d, $lt: nextDay };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter).populate('user', 'fullName phone email').sort({ bookingDate: 1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);

  res.render('admin/bookings/index', {
    title: 'Quản lý lịch hẹn - Admin',
    bookings, total, page,
    totalPages: Math.ceil(total / limit),
    statuses: BOOKING_STATUSES, statusLabels: STATUS_LABELS,
    query: req.query,
  });
});

// ─── PUT /admin/lich-hen/:id/trang-thai ───────────────────────
export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, adminNote, cancelReason } = req.body;
  if (!BOOKING_STATUSES.includes(status)) throw new AppError('Trạng thái không hợp lệ', 400);

  const updateData: any = { status };
  if (adminNote) updateData.adminNote = adminNote;
  if (status === 'cancelled' && cancelReason) updateData.cancelReason = cancelReason;

  await Booking.findByIdAndUpdate(req.params.id, updateData);
  req.flash('success', `Đã cập nhật lịch hẹn → ${STATUS_LABELS[status]}`);
  res.redirect('/admin/lich-hen');
});
