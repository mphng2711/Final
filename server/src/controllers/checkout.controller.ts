import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Coupon from '../models/Coupon';
import Payment from '../models/Payment';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// CHECKOUT CONTROLLER - Đặt hàng & Thanh toán
// ============================================================

const SHIPPING_FEE = 30000; // 30k phí ship mặc định
const FREE_SHIP_THRESHOLD = 500000; // Miễn phí ship từ 500k

// ─── GET /thanh-toan ──────────────────────────────────────────
export const getCheckoutPage = catchAsync(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user!._id })
    .populate('items.product', 'name slug thumbnail variants isActive')
    .lean();

  if (!cart || !(cart.items as any[]).length) {
    req.flash('error', 'Giỏ hàng của bạn đang trống');
    return res.redirect('/gio-hang');
  }

  // Kiểm tra sản phẩm còn hoạt động
  const invalidItems = (cart.items as any[]).filter(
    (item: any) => !item.product || !item.product.isActive
  );
  if (invalidItems.length) {
    req.flash('error', 'Có sản phẩm trong giỏ hàng đã ngừng kinh doanh. Vui lòng cập nhật giỏ hàng.');
    return res.redirect('/gio-hang');
  }

  const subtotal = cart.totalAmount as number;
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;

  res.render('client/checkout', {
    title: 'Thanh toán - PurePaw',
    cart,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    user: req.user,
    couponDiscount: 0,
  });
});

// ─── POST /thanh-toan/kiem-tra-coupon ────────────────────────
export const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const { couponCode, subtotal } = req.body;
  const now = new Date();

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
    applicableTo: { $in: ['all', 'product'] },
  });

  if (!coupon) {
    return res.json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
  }

  const sub = parseFloat(subtotal);
  if (coupon.minOrderAmount && sub < coupon.minOrderAmount) {
    return res.json({
      success: false,
      message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}₫ để dùng mã này`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (sub * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  return res.json({
    success: true,
    couponId: coupon._id,
    discountAmount: Math.round(discountAmount),
    message: `Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}₫`,
  });
});

// ─── POST /thanh-toan ─────────────────────────────────────────
export const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const { fullName, phone, street, ward, district, city, note, paymentMethod, couponId } = req.body;

  // Validate thông tin giao hàng
  if (!fullName || !phone || !street || !ward || !district || !city) {
    req.flash('error', 'Vui lòng điền đầy đủ thông tin giao hàng');
    return res.redirect('/thanh-toan');
  }

  // Lấy giỏ hàng với populate đầy đủ
  const cart = await Cart.findOne({ user: req.user!._id })
    .populate('items.product', 'name variants isActive')
    .lean();

  if (!cart || !(cart.items as any[]).length) {
    req.flash('error', 'Giỏ hàng trống');
    return res.redirect('/gio-hang');
  }

  // Build order items
  const items = (cart.items as any[]).map((item: any) => {
    const product = item.product;
    const variant = (product.variants as any[]).find(
      (v: any) => v._id.toString() === item.variant.toString()
    );
    return {
      product: product._id,
      productName: product.name,
      variant: item.variant,
      variantName: variant ? variant.name : 'Mặc định',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    };
  });

  const subtotal = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;

  // Xử lý coupon
  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponId) {
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.round(discountAmount);
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
      appliedCoupon = coupon._id;
    }
  }

  const totalAmount = subtotal + shippingFee - discountAmount;

  // Sinh orderCode
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderCode = `PP-${datePart}-${randomPart}`;

  // Tạo Order
  const order = await Order.create({
    orderCode,
    user: req.user!._id,
    items,
    shippingAddress: { fullName, phone, street, ward, district, city },
    coupon: appliedCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    note,
    status: 'pending',
  });

  // Tạo Payment record
  const validMethods = ['cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay'];
  const method = validMethods.includes(paymentMethod) ? paymentMethod : 'cod';

  await Payment.create({
    user: req.user!._id,
    order: order._id,
    paymentType: 'order',
    method,
    amount: totalAmount,
    status: method === 'cod' ? 'pending' : 'pending',
  });

  // Xóa giỏ hàng sau khi đặt hàng thành công
  await Cart.findOneAndUpdate(
    { user: req.user!._id },
    { items: [], totalAmount: 0 }
  );

  req.flash('success', `Đặt hàng thành công! Mã đơn hàng: ${orderCode} 🎉`);
  res.redirect('/tai-khoan/don-hang');
});
