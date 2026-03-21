import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';

import connectDB from './config/database';
import config from './config/env';
import logger from './utils/logger';
import { setLocals } from './middlewares/auth.middleware';
import { globalErrorHandler } from './middlewares/error.middleware';

// ─── Routes ──────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import adminRoutes from './routes/admin.routes';

// ============================================================
// PURE PAW WEB - Server Entry Point (12-Factor App)
// ============================================================

const app = express();
const PORT = config.port;

// ─── View Engine: EJS ────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');              // Layout mặc định cho client
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ─── Static Files ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Core Middleware ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));             // Hỗ trợ PUT/DELETE từ HTML form

// ─── Session + Flash ─────────────────────────────────────────
app.use(session({
  secret: config.jwt.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, secure: config.env === 'production' },
}));
app.use(flash());

// ─── CORS (cho API endpoints nếu cần) ────────────────────────
app.use('/api', cors({ origin: config.clientUrl, credentials: true }));

// ─── HTTP Logger ─────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ─── Global res.locals (currentUser + flash messages) ────────
app.use(setLocals);

// ─── Health Check (API - không cần auth) ─────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🐾 PURE PAW API đang chạy!',
    timestamp: new Date().toISOString(),
  });
});

// ─── Mount Routes ─────────────────────────────────────────────
app.use('/', authRoutes);                       // /dang-nhap, /dang-ky, /dang-xuat
app.use('/admin', adminRoutes);                 // /admin/*
app.use('/', clientRoutes);                     // /, /san-pham, /grooming, /tai-khoan, ...

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Không tìm thấy trang', layout: 'layouts/main' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────
let server: any;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    logger.info('========================================');
    logger.info('🐾 PURE PAW Server đang chạy');
    logger.info(`   URL:  http://localhost:${PORT}`);
    logger.info(`   Env:  ${config.env}`);
    logger.info('========================================');
  });
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  logger.info(`Nhận tín hiệu ${signal}. Đang đóng server an toàn...`);
  if (server) {
    server.close(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('📦 MongoDB đã ngắt kết nối an toàn.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => { process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
