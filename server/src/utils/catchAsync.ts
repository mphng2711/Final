import { Request, Response, NextFunction } from 'express';

// ============================================================
// CATCH ASYNC - Wrapper để tránh try/catch boilerplate
// Tất cả async controller functions được bọc bởi hàm này
// ============================================================

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const catchAsync = (fn: AsyncFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
