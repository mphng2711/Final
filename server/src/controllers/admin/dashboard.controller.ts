import { Request, Response } from 'express';
import User from '../../models/User';
import Product from '../../models/Product';
import Order from '../../models/Order';
import Booking from '../../models/Booking';
import Category from '../../models/Category';
import catchAsync from '../../utils/catchAsync';

// ============================================================
// ADMIN DASHBOARD CONTROLLER - Thống kê tổng quan
// ============================================================

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  // Ngày 30 ngày trước
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Chạy song song tất cả queries để tăng hiệu suất
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalCategories,
    revenueResult,
    ordersByStatus,
    recentOrders,
    topProducts,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Category.countDocuments({ isActive: true }),

    // Tổng doanh thu (chỉ đơn delivered)
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    // Đơn hàng theo trạng thái
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // 5 đơn hàng gần nhất
    Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Top 5 sản phẩm bán chạy
    Product.find({ isActive: true })
      .sort({ totalSold: -1 })
      .limit(5)
      .select('name thumbnail totalSold averageRating')
      .lean(),

    // 5 lịch hẹn gần nhất cần xử lý
    Booking.find({ status: { $in: ['pending', 'confirmed'] } })
      .populate('user', 'fullName phone')
      .sort({ bookingDate: 1 })
      .limit(5)
      .lean(),
  ]);

  const revenue30Days = revenueResult[0]?.total || 0;

  // Format ordersByStatus thành object dễ dùng trong view
  const statusMap: Record<string, number> = {};
  ordersByStatus.forEach((s: any) => { statusMap[s._id] = s.count; });

  res.render('admin/dashboard', {
    title: 'Admin Dashboard - PurePaw',
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      revenue30Days,
    },
    statusMap,
    recentOrders,
    topProducts,
    recentBookings,
  });
});
