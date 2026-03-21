import { Request, Response } from 'express';
import Order from '../../models/Order';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';

// ============================================================
// ADMIN ORDER CONTROLLER - Quản lý đơn hàng
// ============================================================

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý', shipping: 'Đang giao',
  delivered: 'Đã giao', cancelled: 'Đã hủy', returned: 'Đã trả hàng',
};

// ─── GET /admin/don-hang ──────────────────────────────────────
export const listOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.orderCode = { $regex: req.query.search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'fullName email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.render('admin/orders/index', {
    title: 'Quản lý đơn hàng - Admin',
    orders, total, page,
    totalPages: Math.ceil(total / limit),
    statuses: ORDER_STATUSES, statusLabels: STATUS_LABELS,
    query: req.query,
  });
});

// ─── GET /admin/don-hang/:id ──────────────────────────────────
export const getOrderDetail = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'fullName email phone')
    .populate('items.product', 'name thumbnail')
    .lean();

  if (!order) throw new AppError('Đơn hàng không tồn tại', 404);

  res.render('admin/orders/detail', {
    title: `Đơn hàng ${(order as any).orderCode} - Admin`,
    order, statuses: ORDER_STATUSES, statusLabels: STATUS_LABELS,
  });
});

// ─── PUT /admin/don-hang/:id/trang-thai ───────────────────────
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, cancelReason } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw new AppError('Trạng thái không hợp lệ', 400);

  const updateData: any = { status };
  if (status === 'cancelled' && cancelReason) updateData.cancelReason = cancelReason;

  await Order.findByIdAndUpdate(req.params.id, updateData);
  req.flash('success', `Đã cập nhật trạng thái đơn hàng → ${STATUS_LABELS[status]}`);
  res.redirect(`/admin/don-hang/${req.params.id}`);
});
