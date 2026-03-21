import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as reviewController from '../controllers/review.controller';
import * as homeController from '../controllers/home.controller';
import * as productController from '../controllers/product.controller';
import * as bookingController from '../controllers/booking.controller';
import * as userController from '../controllers/user.controller';
import * as cartController from '../controllers/cart.controller';
import * as checkoutController from '../controllers/checkout.controller';
import * as blogController from '../controllers/blog.controller';

// ============================================================
// CLIENT ROUTES - Trang người dùng
// ============================================================

const router = Router();

// ─── Home & Pages ────────────────────────────────────────────
router.get('/', homeController.getHomePage);
router.get('/gioi-thieu', homeController.getAboutPage);
router.get('/lien-he', homeController.getContactPage);
router.post('/lien-he', homeController.submitContact);

// ─── Products ────────────────────────────────────────────────
router.get('/san-pham', productController.getProductsPage);
router.get('/san-pham/:slug', productController.getProductDetailPage);

// ─── Review sản phẩm (cần đăng nhập) ────────────────────────
router.post('/san-pham/:slug/danh-gia', protect, reviewController.submitProductReview);

// ─── Grooming / Booking ──────────────────────────────────────
router.get('/grooming', bookingController.getGroomingPage);
router.post('/grooming/dat-lich', protect, bookingController.submitBooking);

// ─── Giỏ hàng (cần đăng nhập) ────────────────────────────────
router.get('/gio-hang', protect, cartController.getCartPage);
router.post('/gio-hang/them', protect, cartController.addToCart);
router.put('/gio-hang/:itemId', protect, cartController.updateCartItem);
router.delete('/gio-hang/:itemId', protect, cartController.removeCartItem);
router.delete('/gio-hang', protect, cartController.clearCart);

// ─── Checkout / Đặt hàng (cần đăng nhập) ────────────────────
router.get('/thanh-toan', protect, checkoutController.getCheckoutPage);
router.post('/thanh-toan/kiem-tra-coupon', protect, checkoutController.applyCoupon);
router.post('/thanh-toan', protect, checkoutController.placeOrder);

// ─── Blog / Tin tức ──────────────────────────────────────────
router.get('/tin-tuc', blogController.getBlogsPage);
router.get('/tin-tuc/:slug', blogController.getBlogDetail);

// ─── User Profile (cần đăng nhập) ────────────────────────────
router.get('/tai-khoan', protect, userController.getProfilePage);
router.post('/tai-khoan', protect, userController.updateProfile);
router.post('/tai-khoan/doi-mat-khau', protect, userController.changePassword);
router.get('/tai-khoan/don-hang', protect, userController.getMyOrders);
router.get('/tai-khoan/don-hang/:id', protect, userController.getOrderDetail);
router.post('/tai-khoan/don-hang/:id/huy', protect, userController.cancelOrder);
router.get('/tai-khoan/lich-hen', protect, userController.getMyBookings);

// ─── Chính sách & Điều khoản ─────────────────────────────────
router.get('/chinh-sach', homeController.getPoliciesPage);

export default router;
