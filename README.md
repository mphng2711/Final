# 🐾 PurePaw Pet House — Tài liệu dự án

<p align="center">
  <img src="server/public/assets/logo.png" alt="PurePaw Logo" height="80">
</p>

<p align="center">
  <strong>Ứng dụng web thương mại điện tử thú cưng toàn diện</strong><br>
  Node.js · Express · TypeScript · MongoDB · EJS
</p>

---

## 📋 Mục lục

1. [Giới thiệu](#-giới-thiệu)
2. [Tech Stack](#-tech-stack)
3. [Tính năng](#-tính-năng)
4. [Cấu trúc dự án](#-cấu-trúc-dự-án)
5. [Cài đặt & Chạy](#-cài-đặt--chạy)
6. [Biến môi trường](#-biến-môi-trường)
7. [Tài khoản mặc định](#-tài-khoản-mặc-định)
8. [Routes & API](#-routes--api)
9. [Database Models](#-database-models)
10. [Kiến trúc & Tiêu chuẩn](#-kiến-trúc--tiêu-chuẩn)
11. [Bảo mật](#-bảo-mật)
12. [Upload ảnh](#-upload-ảnh)

---

## 🐾 Giới thiệu

**PurePaw Pet House** là nền tảng thương mại điện tử chuyên biệt cho thú cưng, bao gồm:

- 🛍 **Shop online** — Mua thức ăn, phụ kiện thú cưng
- ✂️ **Grooming Spa** — Đặt lịch cắt tỉa, chăm sóc thú cưng
- 📰 **Blog** — Kiến thức, mẹo chăm sóc thú cưng
- 👤 **Tài khoản người dùng** — Quản lý đơn hàng, lịch hẹn, hồ sơ
- 🔧 **Trang quản trị Admin** — Dashboard, CRUD sản phẩm/đơn hàng/blog/coupon/...

---

## ⚡ Tech Stack

| Layer | Công nghệ | Version |
|-------|-----------|---------|
| Runtime | Node.js + TypeScript | v18+ |
| Framework | Express.js | v4 |
| Database | MongoDB + Mongoose | v7+ |
| Template Engine | EJS + express-ejs-layouts | — |
| Authentication | JWT + bcryptjs | — |
| File Upload | Multer | — |
| Logging | Winston + Morgan | — |
| Dev Tools | ts-node-dev, slugify | — |
| Form Method | method-override (PUT/DELETE) | — |

---

## ✅ Tính năng

### 👤 Client (Người dùng)
- [x] Đăng ký / Đăng nhập / Đăng xuất (JWT Cookie)
- [x] Trang chủ: sản phẩm nổi bật, banner, danh mục
- [x] Danh sách sản phẩm: filter, search, sort, phân trang
- [x] Chi tiết sản phẩm: gallery ảnh, variants, đánh giá
- [x] **Giỏ hàng** (thêm/sửa/xóa, tính tổng real-time)
- [x] **Checkout** (thông tin giao hàng, phương thức thanh toán, áp dụng coupon)
- [x] Grooming Spa: đặt lịch hẹn
- [x] **Blog** — danh sách bài viết, chi tiết, filter theo danh mục
- [x] **Đánh giá sản phẩm** (cần đã mua hàng)
- [x] Hồ sơ cá nhân: cập nhật thông tin, xem lịch sử đơn/lịch hẹn
- [x] Trang Giới thiệu, Liên hệ

### 🔧 Admin (Quản trị viên)
- [x] Dashboard: thống kê doanh thu, đơn hàng, người dùng
- [x] **Sản phẩm**: CRUD đầy đủ, **upload ảnh thumbnail + gallery**, toggle hiển thị
- [x] **Danh mục**: CRUD, slug tự sinh
- [x] **Đơn hàng**: xem chi tiết, cập nhật trạng thái
- [x] **Lịch hẹn Spa**: xem, cập nhật trạng thái
- [x] **Người dùng**: danh sách, block/unblock
- [x] **Blog**: CRUD bài viết, publish/draft
- [x] **Mã giảm giá (Coupon)**: CRUD, toggle, hỗ trợ % và tiền cố định
- [x] **Đánh giá**: duyệt/ẩn, phản hồi admin, xóa
- [x] **FAQ**: CRUD câu hỏi thường gặp, sắp xếp, danh mục

---

## 🗂 Cấu trúc dự án

```
CLIENT-PUREPAW-main/
├── _backup/                         # Files cũ không còn dùng
├── server/                          # 🚀 Ứng dụng chính (Node.js + Express)
│   ├── public/                      # Static files
│   │   ├── assets/                  # CSS, ảnh, fonts gốc của frontend
│   │   └── uploads/                 # 📁 Ảnh upload (tự tạo khi chạy)
│   │       ├── products/            ← Ảnh sản phẩm
│   │       └── blogs/               ← Ảnh blog
│   └── src/
│       ├── config/
│       │   ├── database.ts          # Kết nối MongoDB
│       │   └── env.ts               # Load & validate biến môi trường
│       │
│       ├── controllers/
│       │   ├── auth.controller.ts   # Đăng nhập/ký/xuất
│       │   ├── home.controller.ts   # Trang chủ, giới thiệu, liên hệ
│       │   ├── product.controller.ts# Danh sách & chi tiết sản phẩm
│       │   ├── booking.controller.ts# Grooming & đặt lịch
│       │   ├── cart.controller.ts   # Giỏ hàng (xem/thêm/sửa/xóa)
│       │   ├── checkout.controller.ts# Checkout, áp coupon, tạo đơn
│       │   ├── review.controller.ts # Gửi đánh giá sản phẩm
│       │   ├── blog.controller.ts   # Danh sách & chi tiết blog
│       │   ├── user.controller.ts   # Profile, lịch sử đơn/lịch hẹn
│       │   └── admin/
│       │       ├── dashboard.controller.ts
│       │       ├── product.admin.controller.ts  # CRUD + upload ảnh
│       │       ├── category.admin.controller.ts
│       │       ├── order.admin.controller.ts
│       │       ├── booking.admin.controller.ts
│       │       ├── user.admin.controller.ts
│       │       ├── blog.admin.controller.ts
│       │       ├── coupon.admin.controller.ts
│       │       ├── review.admin.controller.ts
│       │       └── faq.admin.controller.ts
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.ts   # protect, restrictTo, setLocals
│       │   ├── error.middleware.ts  # Global error handler
│       │   └── upload.middleware.ts # Multer (thumbnail, gallery)
│       │
│       ├── models/                  # 11 Mongoose Schemas
│       │   ├── User.ts
│       │   ├── Product.ts           # Có variants, images[], thumbnail
│       │   ├── Category.ts
│       │   ├── Cart.ts
│       │   ├── Order.ts             # orderCode tự sinh
│       │   ├── Payment.ts
│       │   ├── Booking.ts           # bookingCode tự sinh
│       │   ├── Review.ts
│       │   ├── Blog.ts
│       │   ├── Coupon.ts
│       │   └── FAQ.ts
│       │
│       ├── routes/
│       │   ├── auth.routes.ts       # /dang-nhap, /dang-ky, /dang-xuat
│       │   ├── client.routes.ts     # Tất cả route client
│       │   └── admin.routes.ts      # Tất cả route /admin/*
│       │
│       ├── seeders/
│       │   └── seed.ts              # Seed dữ liệu mẫu
│       │
│       ├── utils/
│       │   ├── appError.ts          # Custom error class
│       │   ├── catchAsync.ts        # Wrapper async/await
│       │   └── logger.ts            # Winston logger
│       │
│       ├── views/                   # EJS Templates
│       │   ├── layouts/
│       │   │   ├── main.ejs         # Layout client (header, footer, nav)
│       │   │   └── admin.ejs        # Layout admin (sidebar, topbar)
│       │   ├── auth/
│       │   │   ├── login.ejs
│       │   │   └── register.ejs
│       │   ├── client/
│       │   │   ├── index.ejs        # Trang chủ
│       │   │   ├── products.ejs     # Danh sách sản phẩm
│       │   │   ├── product-detail.ejs
│       │   │   ├── grooming.ejs     # Spa & đặt lịch
│       │   │   ├── cart.ejs         # Giỏ hàng
│       │   │   ├── checkout.ejs     # Thanh toán
│       │   │   ├── blogs.ejs        # Danh sách bài viết
│       │   │   ├── blog-detail.ejs  # Chi tiết bài viết
│       │   │   ├── about.ejs
│       │   │   ├── contact.ejs
│       │   │   └── profile.ejs      # Hồ sơ + lịch sử
│       │   ├── admin/
│       │   │   ├── dashboard.ejs
│       │   │   ├── products/        index.ejs, form.ejs (có upload ảnh)
│       │   │   ├── categories/      index.ejs, form.ejs
│       │   │   ├── orders/          index.ejs, detail.ejs
│       │   │   ├── bookings/        index.ejs
│       │   │   ├── users/           index.ejs
│       │   │   ├── blogs/           index.ejs, form.ejs
│       │   │   ├── coupons/         index.ejs, form.ejs
│       │   │   ├── reviews/         index.ejs
│       │   │   └── faqs/            index.ejs, form.ejs
│       │   └── errors/
│       │       ├── 404.ejs
│       │       └── 500.ejs
│       └── server.ts                # Entry point
│
├── package.json                     # Root workspace config
├── README.md
└── tsconfig.json
```

---

## ⚡ Cài đặt & Chạy

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **MongoDB** >= 6.x (local hoặc MongoDB Atlas)
- **npm** >= 9.x

---

### 💾 Hướng dẫn thiết lập Database (MongoDB)

Bạn cần có MongoDB để chạy dự án. Tham khảo 1 trong 2 cách sau:

#### Cách 1: Chạy MongoDB Local (Khuyên dùng cho máy tính cá nhân)
1. Tải và cài đặt **[MongoDB Community Server](https://www.mongodb.com/try/download/community)** (cứ Next mặc định).
2. Tải thêm **[MongoDB Compass](https://www.mongodb.com/try/download/compass)** (nếu muốn có giao diện GUI dễ nhìn để quản lý data).
3. Dịch vụ MongoDB sẽ tự động chạy ngầm trên máy bạn. Chuỗi kết nối của bạn sẽ luôn là:  
   👉 `mongodb://localhost:27017/purepaw`

#### Cách 2: Dùng MongoDB Atlas (Cloud - Không cần cài đặt)
1. Tạo 1 tài khoản miễn phí tại **[MongoDB Atlas](https://www.mongodb.com/atlas)**.
2. Tạo 1 Cluster mới (chọn gói **M0 Free**).
3. Tại menu **Database Access**, tạo 1 user mới (lưu lại username và password).
4. Tại menu **Network Access**, nhấn Add IP Address → chọn **Allow Access from Anywhere** (0.0.0.0/0) để không bị chặn kết nối.
5. Quay lại menu **Database**, nhấn **Connect** → **Drivers** → Copy đường dẫn URL.
6. Thay thế `<password>` bằng mật khẩu ở bước 3.  
   👉 Ví dụ đường dẫn của bạn: `mongodb+srv://user123:matkhaucuaBan@cluster0.abcde.mongodb.net/purepaw`

---

### Bước 1 — Cài dependencies

```bash
cd server
npm install
```

### Bước 2 — Cấu hình `.env`

```bash
cp .env.example .env
```

Mở `.env` và điền thông tin:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/purepaw

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# App
CLIENT_URL=http://localhost:5000
```

### Bước 3 — Seed dữ liệu mẫu

```bash
cd server
npx ts-node src/seeders/seed.ts
```

### Bước 4 — Chạy server

```bash
# Development (auto-reload khi sửa file)
npm run dev

# Production
npm run build && npm start
```

> **Truy cập:** http://localhost:5000

---

## 🔑 Biến môi trường

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `PORT` | Port server lắng nghe | `5000` |
| `NODE_ENV` | Môi trường (`development`/`production`) | `development` |
| `MONGODB_URI` | Connection string MongoDB | `mongodb://localhost:27017/purepaw` |
| `JWT_SECRET` | Khóa ký JWT (bí mật, tối thiểu 32 ký tự) | — |
| `JWT_EXPIRES_IN` | Thời gian hết hạn JWT | `7d` |
| `CLIENT_URL` | URL frontend (dùng cho CORS) | `http://localhost:5000` |

---

## 👥 Tài khoản mặc định (sau khi seed)

| Vai trò | Email | Mật khẩu | Quyền truy cập |
|---------|-------|----------|---------------|
| **Admin** | `admin@purepaw.vn` | `Admin@123` | Toàn bộ `/admin/*` + client |
| **User** | `user@purepaw.vn` | `User@123` | Client + tài khoản cá nhân |

> ⚠️ Đổi mật khẩu ngay sau khi deploy production!

---

## 🌐 Routes & API

### 🔐 Auth
| Method | Route | Chức năng |
|--------|-------|-----------|
| GET | `/dang-nhap` | Trang đăng nhập |
| POST | `/dang-nhap` | Xử lý đăng nhập → set JWT cookie |
| GET | `/dang-ky` | Trang đăng ký |
| POST | `/dang-ky` | Tạo tài khoản mới |
| GET | `/dang-xuat` | Đăng xuất → xóa cookie |

### 🛍 Client — Sản phẩm
| Method | Route | Chức năng |
|--------|-------|-----------|
| GET | `/` | Trang chủ |
| GET | `/san-pham` | Danh sách (filter `?category`, `?search`, `?sort`, `?page`) |
| GET | `/san-pham/:slug` | Chi tiết sản phẩm + lịch sử đánh giá |
| POST | `/san-pham/:slug/danh-gia` | Gửi đánh giá (cần đăng nhập + đã mua) |

### 🛒 Client — Giỏ hàng
| Method | Route | Chức năng | Auth |
|--------|-------|-----------|------|
| GET | `/gio-hang` | Xem giỏ hàng | ✅ |
| POST | `/gio-hang` | Thêm sản phẩm vào giỏ | ✅ |
| PUT | `/gio-hang/:itemId` | Cập nhật số lượng | ✅ |
| DELETE | `/gio-hang/:itemId` | Xóa 1 item | ✅ |
| DELETE | `/gio-hang` | Xóa toàn bộ giỏ | ✅ |

### 💳 Client — Checkout
| Method | Route | Chức năng | Auth |
|--------|-------|-----------|------|
| GET | `/thanh-toan` | Trang checkout | ✅ |
| POST | `/thanh-toan` | Đặt hàng (tạo Order + Payment) | ✅ |
| POST | `/thanh-toan/kiem-tra-coupon` | Kiểm tra coupon (JSON API) | ✅ |

### ✂️ Client — Grooming Spa
| Method | Route | Chức năng | Auth |
|--------|-------|-----------|------|
| GET | `/grooming` | Trang dịch vụ spa | — |
| POST | `/grooming/dat-lich` | Đặt lịch hẹn | ✅ |

### 📰 Client — Blog
| Method | Route | Chức năng |
|--------|-------|-----------|
| GET | `/tin-tuc` | Danh sách bài viết (filter `?category`, `?page`) |
| GET | `/tin-tuc/:slug` | Chi tiết bài viết |

### 👤 Client — Tài khoản
| Method | Route | Chức năng | Auth |
|--------|-------|-----------|------|
| GET | `/tai-khoan` | Hồ sơ + chỉnh sửa thông tin | ✅ |
| GET | `/tai-khoan/don-hang` | Lịch sử đơn hàng | ✅ |
| GET | `/tai-khoan/lich-hen` | Lịch hẹn spa của tôi | ✅ |

### 🔧 Admin — Quản trị (cần role admin)

| Method | Route | Chức năng |
|--------|-------|-----------|
| GET | `/admin` | Dashboard tổng quan |
| — | **Sản phẩm** | — |
| GET/POST | `/admin/san-pham` | Danh sách / Tạo mới (multipart/upload ảnh) |
| GET | `/admin/san-pham/them-moi` | Form tạo sản phẩm |
| GET | `/admin/san-pham/:id/sua` | Form sửa sản phẩm |
| PUT | `/admin/san-pham/:id` | Cập nhật (có upload ảnh mới) |
| DELETE | `/admin/san-pham/:id` | Xóa + xóa ảnh vật lý |
| PATCH | `/admin/san-pham/:id/toggle` | Ẩn/hiện |
| — | **Danh mục** | — |
| GET/POST | `/admin/danh-muc` | Danh sách / Tạo |
| PUT | `/admin/danh-muc/:id` | Cập nhật |
| DELETE | `/admin/danh-muc/:id` | Xóa |
| — | **Đơn hàng** | — |
| GET | `/admin/don-hang` | Danh sách (filter trạng thái) |
| GET | `/admin/don-hang/:id` | Chi tiết đơn hàng |
| PUT | `/admin/don-hang/:id/trang-thai` | Cập nhật trạng thái |
| — | **Lịch hẹn** | — |
| GET | `/admin/lich-hen` | Danh sách lịch hẹn |
| PUT | `/admin/lich-hen/:id/trang-thai` | Cập nhật trạng thái |
| — | **Người dùng** | — |
| GET | `/admin/nguoi-dung` | Danh sách người dùng |
| PATCH | `/admin/nguoi-dung/:id/toggle` | Block/Unblock |
| — | **Blog** | — |
| GET/POST | `/admin/bai-viet` | Danh sách / Tạo |
| PUT/DELETE | `/admin/bai-viet/:id` | Sửa / Xóa |
| — | **Coupon** | — |
| GET/POST | `/admin/coupon` | Danh sách / Tạo |
| PUT/DELETE | `/admin/coupon/:id` | Sửa / Xóa |
| PATCH | `/admin/coupon/:id/toggle` | Bật/Tắt |
| — | **Đánh giá** | — |
| GET | `/admin/danh-gia` | Danh sách (filter type, status) |
| PATCH | `/admin/danh-gia/:id/duyet` | Duyệt/Ẩn đánh giá |
| POST | `/admin/danh-gia/:id/phan-hoi` | Phản hồi admin |
| DELETE | `/admin/danh-gia/:id` | Xóa |
| — | **FAQ** | — |
| GET/POST | `/admin/faq` | Danh sách / Tạo |
| PUT/DELETE | `/admin/faq/:id` | Sửa / Xóa |

---

## 🗃 Database Models

| Model | Collection | Mô tả |
|-------|-----------|-------|
| `User` | `users` | Tài khoản, role, địa chỉ, avatar |
| `Product` | `products` | Sản phẩm, variants[], images[], thumbnail |
| `Category` | `categories` | Danh mục sản phẩm, slug |
| `Cart` | `carts` | Giỏ hàng per user, items[], totalAmount |
| `Order` | `orders` | Đơn hàng, orderCode tự sinh, trạng thái |
| `Payment` | `payments` | Thanh toán liên kết Order/Booking |
| `Booking` | `bookings` | Lịch hẹn spa, bookingCode tự sinh |
| `Review` | `reviews` | Đánh giá sản phẩm/dịch vụ, adminReply |
| `Blog` | `blogs` | Bài viết, slug, publish/draft |
| `Coupon` | `coupons` | Mã giảm giá, % hoặc tiền cố định |
| `FAQ` | `faqs` | Câu hỏi thường gặp, phân loại |

### Quan hệ giữa các Model

```
User ──────────── Cart ─── Product
  │                           │
  │                        Review
  ├── Order ──── Payment
  │      │
  ├── Booking ── Payment
  │
  └── Review
```

---

## 🏗 Kiến trúc & Tiêu chuẩn

### MVC Pattern
```
Request → Router → Middleware → Controller → Model → View → Response
```

### 12-Factor App
| Factor | Áp dụng |
|--------|---------|
| Config | Biến môi trường qua `.env` |
| Logs | Winston ghi ra stdout |
| Stateless | JWT không lưu session phía server |
| Port | Đọc từ `process.env.PORT` |

### Error Handling
```
controller → catchAsync wrapper → AppError → globalErrorHandler middleware
```

- `AppError(message, statusCode)` — Lỗi nghiệp vụ có thể dự đoán
- `globalErrorHandler` — Bắt tất cả lỗi, format JSON/HTML phù hợp theo `NODE_ENV`

---

## 🔐 Bảo mật

| Cơ chế | Mô tả |
|--------|-------|
| JWT httpOnly Cookie | Token không thể đọc bởi JavaScript (chống XSS) |
| bcrypt 12 rounds | Hash mật khẩu không thể reverse |
| `restrictTo('admin')` | Bảo vệ toàn bộ `/admin/*` |
| Cookie `secure: true` | Chỉ gửi qua HTTPS trên production |
| Mongoose validation | Validate dữ liệu trước khi lưu DB |
| File filter (Multer) | Chỉ nhận upload ảnh, giới hạn 5MB/file |

---

## 🖼 Upload ảnh

Ảnh upload được lưu tại `server/public/uploads/`:

```
public/uploads/
├── products/     ← Ảnh sản phẩm (thumbnail + gallery)
└── blogs/        ← Ảnh blog
```

**Quy tắc:**
- Định dạng chấp nhận: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`
- Kích thước tối đa: **5MB** / file
- Thumbnail: 1 ảnh duy nhất
- Gallery: tối đa **8 ảnh**
- **Tự động xóa** ảnh cũ khi thay ảnh mới hoặc xóa sản phẩm

> 💡 Thư mục `uploads/` được tạo tự động khi server khởi động. Không commit vào git (đã có trong `.gitignore`).

---

## 📝 Notes cho Developer

### Thêm tính năng mới
1. Tạo **Model** trong `src/models/`
2. Tạo **Controller** trong `src/controllers/` (bọc bằng `catchAsync`)
3. Thêm **Route** vào `client.routes.ts` hoặc `admin.routes.ts`
4. Tạo **View** tương ứng trong `src/views/`

### Debug
```bash
# Xem log server
npm run dev

# Kiểm tra kết nối DB
# Log sẽ in: "✅ MongoDB connected: localhost:27017"
```

### Cấu trúc Flash messages
```typescript
req.flash('success', 'Thông báo thành công');
req.flash('error', 'Thông báo lỗi');
// → Hiển thị tự động trong layout thông qua res.locals
```

---

<p align="center">
  Made with ❤️ by PurePaw Team · 2026
</p>
