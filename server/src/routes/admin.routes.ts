import { Router } from 'express';
import methodOverride from 'method-override';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { uploadProductImages } from '../middlewares/upload.middleware';
import * as dashboardCtrl from '../controllers/admin/dashboard.controller';
import * as productCtrl from '../controllers/admin/product.admin.controller';
import * as categoryCtrl from '../controllers/admin/category.admin.controller';
import * as orderCtrl from '../controllers/admin/order.admin.controller';
import * as userCtrl from '../controllers/admin/user.admin.controller';
import * as bookingCtrl from '../controllers/admin/booking.admin.controller';
import * as blogCtrl from '../controllers/admin/blog.admin.controller';
import * as faqCtrl from '../controllers/admin/faq.admin.controller';
import * as couponCtrl from '../controllers/admin/coupon.admin.controller';
import * as reviewCtrl from '../controllers/admin/review.admin.controller';

// ============================================================
// ADMIN ROUTES - Trang quản trị (yêu cầu role admin)
// ============================================================

const router = Router();

// Áp dụng method-override cho các form HTML (PUT, DELETE)
router.use(methodOverride('_method'));

// Tất cả route admin cần đăng nhập và có role admin
router.use(protect, restrictTo('admin'));

// Set layout admin cho tất cả views trong /admin
router.use((_req, res, next) => {
  res.locals.layout = 'layouts/admin';
  next();
});

// ─── Dashboard ───────────────────────────────────────────────
router.get('/', dashboardCtrl.getDashboard);

// ─── Sản phẩm ────────────────────────────────────────────────
router.get('/san-pham', productCtrl.listProducts);
router.get('/san-pham/them-moi', productCtrl.getCreateProduct);
router.post('/san-pham', uploadProductImages, productCtrl.createProduct);
router.get('/san-pham/:id/sua', productCtrl.getEditProduct);
router.put('/san-pham/:id', uploadProductImages, productCtrl.updateProduct);
router.delete('/san-pham/:id', productCtrl.deleteProduct);
router.patch('/san-pham/:id/toggle', productCtrl.toggleProductStatus);

// ─── Danh mục ────────────────────────────────────────────────
router.get('/danh-muc', categoryCtrl.listCategories);
router.post('/danh-muc/fix-orphans', categoryCtrl.fixOrphanedProducts);
router.get('/danh-muc/them-moi', categoryCtrl.getCreateCategory);
router.post('/danh-muc', categoryCtrl.createCategory);
router.get('/danh-muc/:id/sua', categoryCtrl.getEditCategory);
router.put('/danh-muc/:id', categoryCtrl.updateCategory);
router.delete('/danh-muc/:id', categoryCtrl.deleteCategory);

// ─── Đơn hàng ────────────────────────────────────────────────
router.get('/don-hang', orderCtrl.listOrders);
router.get('/don-hang/:id', orderCtrl.getOrderDetail);
router.put('/don-hang/:id/trang-thai', orderCtrl.updateOrderStatus);

// ─── Người dùng ──────────────────────────────────────────────
router.get('/nguoi-dung', userCtrl.listUsers);
router.patch('/nguoi-dung/:id/toggle', userCtrl.toggleUserStatus);

// ─── Lịch hẹn spa ────────────────────────────────────────────
router.get('/lich-hen', bookingCtrl.listBookings);
router.put('/lich-hen/:id/trang-thai', bookingCtrl.updateBookingStatus);

// ─── Bài viết / Blog ─────────────────────────────────────────
router.get('/bai-viet', blogCtrl.listBlogs);
router.get('/bai-viet/them-moi', blogCtrl.getCreateBlog);
router.post('/bai-viet', blogCtrl.createBlog);
router.get('/bai-viet/:id/sua', blogCtrl.getEditBlog);
router.put('/bai-viet/:id', blogCtrl.updateBlog);
router.delete('/bai-viet/:id', blogCtrl.deleteBlog);

// ─── FAQ ─────────────────────────────────────────────────────
router.get('/faq', faqCtrl.listFAQs);
router.get('/faq/them-moi', faqCtrl.getCreateFAQ);
router.post('/faq', faqCtrl.createFAQ);
router.get('/faq/:id/sua', faqCtrl.getEditFAQ);
router.put('/faq/:id', faqCtrl.updateFAQ);
router.delete('/faq/:id', faqCtrl.deleteFAQ);

// ─── Mã giảm giá ─────────────────────────────────────────────
router.get('/coupon', couponCtrl.listCoupons);
router.get('/coupon/them-moi', couponCtrl.getCreateCoupon);
router.post('/coupon', couponCtrl.createCoupon);
router.get('/coupon/:id/sua', couponCtrl.getEditCoupon);
router.put('/coupon/:id', couponCtrl.updateCoupon);
router.delete('/coupon/:id', couponCtrl.deleteCoupon);
router.patch('/coupon/:id/toggle', couponCtrl.toggleCoupon);

// ─── Đánh giá ────────────────────────────────────────────────
router.get('/danh-gia', reviewCtrl.listReviews);
router.patch('/danh-gia/:id/duyet', reviewCtrl.approveReview);
router.post('/danh-gia/:id/phan-hoi', reviewCtrl.replyReview);
router.delete('/danh-gia/:id', reviewCtrl.deleteReview);

export default router;
