// ============================================================
// APP ERROR - Custom Error Class
// Phân biệt Operational Error (lỗi người dùng) vs Programming Error
// ============================================================

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Lỗi chủ động, không cần crash server

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
