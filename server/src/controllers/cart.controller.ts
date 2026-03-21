import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// CART CONTROLLER - Giỏ hàng
// ============================================================

// ─── GET /gio-hang ────────────────────────────────────────────
export const getCartPage = catchAsync(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user!._id })
    .populate('items.product', 'name slug thumbnail isActive')
    .lean();

  res.render('client/cart', {
    title: 'Giỏ hàng - PurePaw',
    cart: cart || { items: [], totalAmount: 0 },
  });
});

// ─── POST /gio-hang/them ──────────────────────────────────────
export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const isAjax = req.headers['content-type']?.includes('application/json');

  // Lấy thông tin sản phẩm và biến thể
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    if (isAjax) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh' });
    req.flash('error', 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
    return res.redirect('back');
  }

  const variant = (product.variants as any[]).find(
    (v: any) => v._id.toString() === variantId
  );
  if (!variant) {
    if (isAjax) return res.status(400).json({ success: false, message: 'Phân loại sản phẩm không tồn tại' });
    req.flash('error', 'Phân loại sản phẩm không tồn tại');
    return res.redirect('back');
  }

  if (variant.stock < parseInt(quantity)) {
    const msg = `Chỉ còn ${variant.stock} sản phẩm trong kho`;
    if (isAjax) return res.status(400).json({ success: false, message: msg });
    req.flash('error', msg);
    return res.redirect('back');
  }

  const price = variant.salePrice || variant.price;
  const qty = Math.max(1, parseInt(quantity));

  // Tìm hoặc tạo Cart cho user
  let cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) {
    cart = new Cart({ user: req.user!._id, items: [] });
  }

  // Kiểm tra sản phẩm đã có trong giỏ chưa (cùng variant)
  const existingItem = (cart.items as any[]).find(
    (item: any) =>
      item.product.toString() === productId &&
      item.variant.toString() === variantId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + qty;
    if (newQty > variant.stock) {
      const msg = `Chỉ còn ${variant.stock} sản phẩm trong kho`;
      if (isAjax) return res.status(400).json({ success: false, message: msg });
      req.flash('error', msg);
      return res.redirect('back');
    }
    existingItem.quantity = newQty;
  } else {
    (cart.items as any[]).push({
      product: productId,
      variant: variantId,
      quantity: qty,
      price,
    });
  }

  await cart.save();

  // Đếm tổng số items trong giỏ
  const totalItems = (cart.items as any[]).reduce((sum: number, i: any) => sum + i.quantity, 0);

  if (isAjax) {
    return res.json({
      success: true,
      message: `Đã thêm "${product.name}" vào giỏ hàng! 🛒`,
      cartCount: totalItems,
    });
  }

  req.flash('success', `Đã thêm "${product.name}" vào giỏ hàng! 🛒`);
  res.redirect('back');
});

// ─── PUT /gio-hang/:itemId ────────────────────────────────────
export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity);

  if (isNaN(qty) || qty < 1) {
    throw new AppError('Số lượng không hợp lệ', 400);
  }

  const cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) throw new AppError('Giỏ hàng không tồn tại', 404);

  const item = (cart.items as any[]).find(
    (i: any) => i._id.toString() === req.params.itemId
  );
  if (!item) throw new AppError('Sản phẩm không có trong giỏ hàng', 404);

  item.quantity = qty;
  await cart.save();

  req.flash('success', 'Đã cập nhật số lượng');
  res.redirect('/gio-hang');
});

// ─── DELETE /gio-hang/:itemId ─────────────────────────────────
export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user!._id });
  if (!cart) throw new AppError('Giỏ hàng không tồn tại', 404);

  (cart.items as any[]) = (cart.items as any[]).filter(
    (i: any) => i._id.toString() !== req.params.itemId
  );
  await cart.save();

  req.flash('success', 'Đã xóa sản phẩm khỏi giỏ hàng');
  res.redirect('/gio-hang');
});

// ─── DELETE /gio-hang ─────────────────────────────────────────
export const clearCart = catchAsync(async (req: Request, res: Response) => {
  await Cart.findOneAndUpdate(
    { user: req.user!._id },
    { items: [], totalAmount: 0 }
  );

  req.flash('success', 'Đã xóa toàn bộ giỏ hàng');
  res.redirect('/gio-hang');
});
