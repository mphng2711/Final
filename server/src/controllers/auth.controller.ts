import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/env';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// ============================================================
// AUTH CONTROLLER - Đăng ký / Đăng nhập / Đăng xuất
// ============================================================

/**
 * Tiện ích: Tạo JWT và set vào cookie httpOnly
 */
const signTokenAndSetCookie = (userId: string, res: Response) => {
  const token = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  res.cookie('token', token, {
    httpOnly: true,                        // Không cho JS client đọc → chống XSS
    secure: config.env === 'production',   // Chỉ HTTPS trên production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 ngày
  });
};

// ─── GET /dang-nhap ───────────────────────────────────────────
export const getLoginPage = (req: Request, res: Response) => {
  if (res.locals.currentUser) return res.redirect('/');
  res.render('auth/login', { title: 'Đăng nhập - PurePaw' });
};

// ─── POST /dang-nhap ──────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    req.flash('error', 'Vui lòng nhập email và mật khẩu');
    return res.redirect('/dang-nhap');
  }

  // Tìm user (select password vì field này bị ẩn mặc định)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !user.isActive) {
    req.flash('error', 'Email hoặc mật khẩu không đúng');
    return res.redirect('/dang-nhap');
  }

  // So sánh password với bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash('error', 'Email hoặc mật khẩu không đúng');
    return res.redirect('/dang-nhap');
  }

  // Đăng nhập thành công → set cookie
  signTokenAndSetCookie(user._id.toString(), res);
  req.flash('success', `Chào mừng trở lại, ${user.fullName}! 🐾`);

  // Admin redirect về dashboard, user thường về trang chủ
  const redirectTo = user.role === 'admin' ? '/admin' : '/';
  res.redirect(redirectTo);
});

// ─── GET /dang-ky ─────────────────────────────────────────────
export const getRegisterPage = (req: Request, res: Response) => {
  if (res.locals.currentUser) return res.redirect('/');
  res.render('auth/register', { title: 'Đăng ký - PurePaw' });
};

// ─── POST /dang-ky ────────────────────────────────────────────
export const register = catchAsync(async (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword, phone } = req.body;

  // Validate
  if (!fullName || !email || !password) {
    req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
    return res.redirect('/dang-ky');
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Mật khẩu xác nhận không khớp');
    return res.redirect('/dang-ky');
  }

  if (password.length < 6) {
    req.flash('error', 'Mật khẩu phải có ít nhất 6 ký tự');
    return res.redirect('/dang-ky');
  }

  // Kiểm tra email trùng
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    req.flash('error', 'Email này đã được đăng ký');
    return res.redirect('/dang-ky');
  }

  // Hash password với bcrypt (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Tạo user mới
  const newUser = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    phone: phone?.trim(),
    role: 'user',
  });

  // Tự động đăng nhập sau khi đăng ký
  signTokenAndSetCookie(newUser._id.toString(), res);
  req.flash('success', `Đăng ký thành công! Chào mừng bạn đến với PurePaw 🐾`);
  res.redirect('/');
});

// ─── GET /dang-xuat ───────────────────────────────────────────
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  req.flash('success', 'Đã đăng xuất thành công');
  res.redirect('/dang-nhap');
};
