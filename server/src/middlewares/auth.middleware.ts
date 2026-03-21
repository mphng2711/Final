import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import User, { IUser } from '../models/User';
import AppError from '../utils/appError';

// ============================================================
// AUTH MIDDLEWARE - Xác thực JWT từ cookie
// ============================================================

// Mở rộng Express Request để gắn thông tin user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * protect - Bảo vệ route, chỉ cho phép user đã đăng nhập
 * JWT được đọc từ cookie httpOnly 'token'
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      // Redirect về trang đăng nhập thay vì trả JSON
      req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
      return res.redirect('/dang-nhap');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // Lấy thông tin user từ DB
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      res.clearCookie('token');
      req.flash('error', 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
      return res.redirect('/dang-nhap');
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.clearCookie('token');
    req.flash('error', 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
    return res.redirect('/dang-nhap');
  }
};

/**
 * restrictTo - Kiểm tra role người dùng
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.flash('error', 'Bạn không có quyền truy cập trang này');
      return res.redirect('/');
    }
    next();
  };
};

/**
 * setLocals - Gắn thông tin user và flash vào res.locals
 * Middleware này chạy cho MỌI request để views luôn có dữ liệu cần thiết
 */
export const setLocals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      const user = await User.findById(decoded.id).select('fullName email avatar role');
      res.locals.currentUser = user || null;
    } else {
      res.locals.currentUser = null;
    }
  } catch {
    res.locals.currentUser = null;
  }

  // Flash messages
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');

  next();
};
