import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

// ============================================================
// AUTH ROUTES - Đăng ký / Đăng nhập / Đăng xuất
// ============================================================

const router = Router();

router.get('/dang-nhap', authController.getLoginPage);
router.post('/dang-nhap', authController.login);

router.get('/dang-ky', authController.getRegisterPage);
router.post('/dang-ky', authController.register);

router.get('/dang-xuat', authController.logout);

export default router;
