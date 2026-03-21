import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError';

// ============================================================
// UPLOAD MIDDLEWARE - Multer config cho upload ảnh
// Lưu vào /server/public/uploads/<folder>
// ============================================================

// __dirname = .../server/src/middlewares → lên 2 cấp đến server/public
const BASE_UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Tạo thư mục nếu chưa có
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Storage engine ──────────────────────────────────────────
function createStorage(subfolder: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(BASE_UPLOAD_DIR, subfolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      // Tên file: timestamp-randomhex.ext
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      cb(null, uniqueName);
    },
  });
}

// ─── File filter — chỉ chấp nhận ảnh ────────────────────────
const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Định dạng ảnh không hợp lệ. Chỉ chấp nhận: ${allowed.join(', ')}`, 400) as any, false);
  }
};

// ─── Exports ─────────────────────────────────────────────────

/** Upload 1 ảnh thumbnail sản phẩm */
export const uploadProductThumbnail = multer({
  storage: createStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('thumbnail');

/** Upload nhiều ảnh gallery sản phẩm (tối đa 8) */
export const uploadProductImages = multer({
  storage: createStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

/** Upload 1 ảnh blog thumbnail */
export const uploadBlogThumbnail = multer({
  storage: createStorage('blogs'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('thumbnail');

/** Helper: Tạo đường dẫn public từ absolute path */
export function toPublicPath(absolutePath: string): string {
  const rel = absolutePath.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/');
  return rel;
}

/** Helper: Xóa file upload cũ */
export function deleteUploadedFile(publicPath: string) {
  if (!publicPath || publicPath.includes('placeholder') || publicPath.includes('assets')) return;
  const abs = path.join(process.cwd(), 'public', publicPath);
  if (fs.existsSync(abs)) {
    fs.unlink(abs, () => {}); // Bỏ qua lỗi nếu không tồn tại
  }
}
