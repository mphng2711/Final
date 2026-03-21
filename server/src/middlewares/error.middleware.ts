import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import config from '../config/env';

// ============================================================
// ERROR MIDDLEWARE - Global Error Handler cho Web (render view)
// ============================================================

/**
 * Xử lý lỗi Mongoose: CastError (ID không hợp lệ)
 */
const handleCastErrorDB = (err: any): AppError => {
  return new AppError(`Giá trị không hợp lệ cho trường "${err.path}": ${err.value}`, 400);
};

/**
 * Xử lý lỗi Mongoose: Duplicate key (unique constraint)
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  return new AppError(`Giá trị trùng lặp: ${value}. Vui lòng dùng giá trị khác`, 400);
};

/**
 * Xử lý lỗi Mongoose: ValidationError
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Dữ liệu không hợp lệ: ${errors.join('. ')}`, 400);
};

/**
 * Global error handler middleware
 * Render trang lỗi thay vì trả JSON (phù hợp cho web server-rendered)
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Chuẩn hoá lỗi Mongoose
  let error = { ...err, message: err.message };
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  logger.error(`[${req.method}] ${req.path} → ${error.statusCode}: ${error.message}`);

  // Nếu là AJAX/API request → trả JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(config.env === 'development' && { stack: err.stack }),
    });
  }

  // Render trang lỗi cho web requests
  if (error.statusCode === 404) {
    return res.status(404).render('errors/404', { title: 'Không tìm thấy trang' });
  }

  res.status(error.statusCode).render('errors/500', {
    title: 'Lỗi máy chủ',
    message: config.env === 'development' ? error.message : 'Có lỗi xảy ra, vui lòng thử lại sau',
  });
};
