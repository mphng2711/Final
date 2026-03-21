import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import slugify from 'slugify';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Blog from '../models/Blog';
import FAQ from '../models/FAQ';

// ============================================================
// SEEDER — PurePaw Pet Shop (đầy đủ dữ liệu mẫu)
// Chạy: npx ts-node src/seeders/seed.ts
// ============================================================

const makeSlug = (text: string) =>
  slugify(text, { lower: true, strict: true, locale: 'vi' });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Blog.deleteMany({}),
      FAQ.deleteMany({}),
    ]);
    console.log('🗑  Đã xóa dữ liệu cũ');

    // ─── Tạo Users ────────────────────────────────────────────
    const [adminPass, userPass] = await Promise.all([
      bcrypt.hash('Admin@123', 12),
      bcrypt.hash('User@123', 12),
    ]);

    const admin = await User.create({
      fullName: 'Admin PurePaw',
      email: 'admin@purepaw.vn',
      password: adminPass,
      role: 'admin',
      phone: '0123456789',
      isActive: true,
    });
    await User.create({
      fullName: 'Nguyễn Thị Lan',
      email: 'user@purepaw.vn',
      password: userPass,
      role: 'user',
      phone: '0987654321',
      isActive: true,
    });
    console.log('👤 Tạo 2 tài khoản (admin + user)');

    // ─── Tạo Categories ────────────────────────────────────────
    const catData = [
      { name: 'Thức ăn cho Chó',      slug: 'thuc-an-cho-cho',    sortOrder: 1 },
      { name: 'Thức ăn cho Mèo',      slug: 'thuc-an-cho-meo',    sortOrder: 2 },
      { name: 'Phụ kiện & Đồ chơi',   slug: 'phu-kien-do-choi',  sortOrder: 3 },
      { name: 'Vệ sinh & Chăm sóc',   slug: 've-sinh-cham-soc',  sortOrder: 4 },
      { name: 'Thú cưng khác',         slug: 'thu-cung-khac',     sortOrder: 5 },
    ];
    const categories = await Category.insertMany(catData);
    const [catDog, catCat, catAcc, catCare] = categories;
    console.log(`🏷  Tạo ${categories.length} danh mục`);

    // ─── Tạo Products ──────────────────────────────────────────
    const products = [
      // ── Thức ăn cho Mèo (catCat) ──────────────────────────
      {
        name: 'Pate cho mèo mọi lứa tuổi laPaw vị thịt bò và gà 375g',
        slug: makeSlug('Pate cho meo moi lua tuoi laPaw vi thit bo va ga 375g'),
        description: '<p>Pate laPaw thơm ngon cho mèo mọi lứa tuổi, vị thịt bò và gà tươi. Giàu protein, bổ sung vitamin và khoáng chất thiết yếu cho sức khỏe toàn diện của mèo cưng.</p><ul><li>Nguyên liệu tươi ngon, không chất bảo quản</li><li>Bổ sung taurine tốt cho tim và mắt</li><li>Vị thơm ngon, mèo biếng ăn cũng thích</li></ul>',
        shortDescription: 'Pate laPaw vị thịt bò và gà cho mèo 375g — giàu protein, không bảo quản',
        category: catCat._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2023/12/pate-meo-lapaw-thit-bo-va-ga-375gr-300x300.jpg',
        images: ['https://lapaw.vn/wp-content/uploads/2023/12/pate-meo-lapaw-thit-bo-va-ga-375gr-300x300.jpg'],
        brand: 'LaPaw', petType: 'cat',
        tags: ['pate', 'mèo', 'lapaw', 'thịt bò', 'gà'],
        variants: [{ name: 'Gói 375g', price: 68000, salePrice: 61740, sku: 'LP-PATE-BOG-375', stock: 80 }],
        isFeatured: true, isActive: true,
      },
      {
        name: 'Hạt cho mèo con laPaw Gourmet chuẩn Âu 1.5kg',
        slug: makeSlug('Hat cho meo con laPaw Gourmet chuan Au hop 15kg v2'),
        description: '<p>Thức ăn hạt cao cấp chuẩn Âu cho mèo con, giàu dinh dưỡng hỗ trợ phát triển toàn diện từ giai đoạn còn nhỏ. Công thức đặc biệt với DHA giúp phát triển trí não.</p>',
        shortDescription: 'Hạt laPaw Gourmet chuẩn Âu cho mèo con, bổ sung DHA',
        category: catCat._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2023/12/1-300x300.png',
        images: ['https://lapaw.vn/wp-content/uploads/2023/12/1-300x300.png'],
        brand: 'LaPaw', petType: 'cat',
        tags: ['hạt', 'mèo con', 'lapaw', 'gourmet'],
        variants: [
          { name: 'Hộp 500g',  price: 32000, salePrice: 28000, sku: 'LP-CAT-KIT-500', stock: 50 },
          { name: 'Hộp 1.5kg', price: 56000, salePrice: 49980, sku: 'LP-CAT-KIT-15',  stock: 60 },
          { name: 'Túi 5kg',   price: 168000, salePrice: 149000, sku: 'LP-CAT-KIT-5K', stock: 30 },
        ],
        isFeatured: true, isActive: true,
      },
      {
        name: 'Hạt cho mèo trưởng thành laPaw Gourmet chuẩn Âu 1.5kg',
        slug: makeSlug('Hat cho meo truong thanh laPaw Gourmet chuan Au hop 15kg v2'),
        description: '<p>Thức ăn hạt cao cấp chuẩn Âu dành riêng cho mèo trưởng thành, cân bằng dinh dưỡng tối ưu với omega-3 và omega-6 giúp lông mượt và da khỏe.</p>',
        shortDescription: 'Hạt laPaw Gourmet cho mèo trưởng thành — omega-3 & -6',
        category: catCat._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2023/12/2-300x300.png',
        images: ['https://lapaw.vn/wp-content/uploads/2023/12/2-300x300.png'],
        brand: 'LaPaw', petType: 'cat',
        tags: ['hạt', 'mèo trưởng thành', 'lapaw'],
        variants: [
          { name: 'Hộp 1.5kg', price: 67000, salePrice: 59920, sku: 'LP-CAT-ADU-15', stock: 55 },
          { name: 'Túi 5kg',   price: 199000, salePrice: 179000, sku: 'LP-CAT-ADU-5K', stock: 25 },
        ],
        isFeatured: false, isActive: true,
      },
      {
        name: 'Hạt laPaw hỗ trợ đường tiêu hóa cho mèo 1.5kg',
        slug: makeSlug('LaPaw Hat dinh duong danh cho meo ho tro duong tieu hoa tui 15kg v2'),
        description: '<p>Hạt dinh dưỡng chuyên biệt giúp mèo hỗ trợ đường tiêu hóa khỏe mạnh, giảm các vấn đề về dạ dày. Bổ sung prebiotic và fiber tự nhiên.</p>',
        shortDescription: 'Hạt laPaw hỗ trợ tiêu hóa cho mèo — prebiotic tự nhiên',
        category: catCat._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2024/11/9-300x300.png',
        images: ['https://lapaw.vn/wp-content/uploads/2024/11/9-300x300.png'],
        brand: 'LaPaw', petType: 'cat',
        tags: ['hạt', 'tiêu hóa', 'mèo', 'lapaw'],
        variants: [{ name: 'Túi 1.5kg', price: 67000, salePrice: 59920, sku: 'LP-CAT-DIG-15', stock: 45 }],
        isFeatured: false, isActive: true,
      },
      // ── Thức ăn cho Chó (catDog) ──────────────────────────
      {
        name: 'Hạt laPaw kiểm soát rỉ mắt cho chó 1.5kg',
        slug: makeSlug('LaPaw Hat dinh duong danh cho cho kiem soat ri mat tui 15kg v2'),
        description: '<p>Hạt dinh dưỡng chuyên biệt giúp chó kiểm soát rỉ mắt hiệu quả. Thành phần đặc biệt hỗ trợ giảm viêm và cải thiện sức đề kháng vùng mắt.</p>',
        shortDescription: 'Hạt laPaw kiểm soát rỉ mắt cho chó — hiệu quả sau 2 tuần',
        category: catDog._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2024/11/5.png',
        images: ['https://lapaw.vn/wp-content/uploads/2024/11/5.png'],
        brand: 'LaPaw', petType: 'dog',
        tags: ['hạt', 'rỉ mắt', 'chó', 'lapaw'],
        variants: [
          { name: 'Túi 1.5kg', price: 320000, salePrice: 288000, sku: 'LP-DOG-EYE-15', stock: 40 },
          { name: 'Túi 5kg',   price: 950000, salePrice: 850000, sku: 'LP-DOG-EYE-5K', stock: 15 },
        ],
        isFeatured: true, isActive: true,
      },
      {
        name: 'Hạt laPaw kiểm soát cân nặng cho chó 1.5kg',
        slug: makeSlug('LaPaw Hat dinh duong danh cho cho kiem soat can nang tui 15kg v2'),
        description: '<p>Hạt giúp chó béo phì hoặc ít vận động kiểm soát cân nặng hiệu quả, giảm mỡ và tăng cơ bắp với L-Carnitine tự nhiên.</p>',
        shortDescription: 'Hạt laPaw kiểm soát cân nặng — L-Carnitine tự nhiên',
        category: catDog._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2024/11/7.png',
        images: ['https://lapaw.vn/wp-content/uploads/2024/11/7.png'],
        brand: 'LaPaw', petType: 'dog',
        tags: ['hạt', 'cân nặng', 'chó', 'lapaw'],
        variants: [{ name: 'Túi 1.5kg', price: 320000, salePrice: 288000, sku: 'LP-DOG-WGT-15', stock: 38 }],
        isFeatured: false, isActive: true,
      },
      {
        name: 'Hạt cho chó trưởng thành laPaw Gourmet 1.5kg',
        slug: makeSlug('Hat cho cho truong thanh lapaw gourmet chuan au hop 15kg v2'),
        description: '<p>Thức ăn hạt cao cấp chuẩn Âu dành cho chó trưởng thành. Cân bằng dinh dưỡng, hỗ trợ xương khớp chắc khỏe với glucosamine tự nhiên.</p>',
        shortDescription: 'Hạt laPaw Gourmet cho chó trưởng thành — glucosamine tự nhiên',
        category: catDog._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2023/12/4.png',
        images: ['https://lapaw.vn/wp-content/uploads/2023/12/4.png'],
        brand: 'LaPaw', petType: 'dog',
        tags: ['hạt', 'chó trưởng thành', 'lapaw', 'gourmet'],
        variants: [
          { name: 'Hộp 1.5kg', price: 248000, salePrice: 222000, sku: 'LP-DOG-ADU-15', stock: 50 },
          { name: 'Túi 5kg',   price: 720000, salePrice: 649000, sku: 'LP-DOG-ADU-5K', stock: 20 },
        ],
        isFeatured: true, isActive: true,
      },
      {
        name: 'Hạt cho chó con laPaw Gourmet 1.5kg',
        slug: makeSlug('Hat cho cho con lapaw gourmet chuan au hop 15kg v2'),
        description: '<p>Thức ăn hạt chuẩn Âu dành cho chó con, giàu canxi và protein hỗ trợ phát triển xương và cơ bắp. DHA từ dầu cá giúp phát triển trí não.</p>',
        shortDescription: 'Hạt laPaw Gourmet cho chó con — canxi & DHA tự nhiên',
        category: catDog._id,
        thumbnail: 'https://lapaw.vn/wp-content/uploads/2023/12/3.png',
        images: ['https://lapaw.vn/wp-content/uploads/2023/12/3.png'],
        brand: 'LaPaw', petType: 'dog',
        tags: ['hạt', 'chó con', 'lapaw', 'gourmet'],
        variants: [
          { name: 'Hộp 1.5kg', price: 260000, salePrice: 234000, sku: 'LP-DOG-PUP-15', stock: 55 },
          { name: 'Túi 5kg',   price: 760000, salePrice: 680000, sku: 'LP-DOG-PUP-5K', stock: 18 },
        ],
        isFeatured: true, isActive: true,
      },
      // ── Phụ kiện & Đồ chơi (catAcc) ──────────────────────
      {
        name: 'Vòng cổ da thật cho chó mèo size S-M-L',
        slug: makeSlug('Vong co da that cho cho meo size S M L v2'),
        description: '<p>Vòng cổ da thật cao cấp, bền chắc và thoải mái cho thú cưng. Khóa inox chắc chắn, vòng D gắn dây dắt. Thiết kế thanh lịch, phù hợp mọi hoàn cảnh.</p>',
        shortDescription: 'Vòng cổ da thật cao cấp cho chó mèo — 3 size S/M/L',
        category: catAcc._id,
        thumbnail: 'https://product.hstatic.net/200000316731/product/vong-co-cho-cho-meo-size-s-thanh-lich_0ea79b13c4b940348b4ad44f59cb70f3.jpg',
        images: ['https://product.hstatic.net/200000316731/product/vong-co-cho-cho-meo-size-s-thanh-lich_0ea79b13c4b940348b4ad44f59cb70f3.jpg'],
        petType: 'other', brand: 'PurePaw',
        tags: ['vòng cổ', 'da', 'phụ kiện'],
        variants: [
          { name: 'Size S', price: 85000, sku: 'COL-S', stock: 30 },
          { name: 'Size M', price: 95000, sku: 'COL-M', stock: 25 },
          { name: 'Size L', price: 105000, sku: 'COL-L', stock: 20 },
        ],
        isFeatured: false, isActive: true,
      },
      {
        name: 'Bát ăn inox 2 ngăn cho chó mèo',
        slug: makeSlug('Bat an inox 2 ngan cho cho meo v2'),
        description: '<p>Bát ăn inox 304 cao cấp 2 ngăn, không rỉ sét, dễ vệ sinh. Đế cao su chống trượt an toàn. Phù hợp để đựng thức ăn lẫn nước uống.</p>',
        shortDescription: 'Bát inox 304 chống rỉ 2 ngăn — đế cao su chống trượt',
        category: catAcc._id,
        thumbnail: 'https://product.hstatic.net/200000316731/product/bat-an-inox-cho-meo-long-ma-vang_a5c4dca16e1f4b1090ea3efba1e2e51d.jpg',
        images: ['https://product.hstatic.net/200000316731/product/bat-an-inox-cho-meo-long-ma-vang_a5c4dca16e1f4b1090ea3efba1e2e51d.jpg'],
        petType: 'other', brand: 'PurePaw',
        tags: ['bát ăn', 'inox', 'phụ kiện'],
        variants: [{ name: 'Bộ 2 bát', price: 120000, salePrice: 95000, sku: 'BOWL-INX-2', stock: 40 }],
        isFeatured: false, isActive: true,
      },
      {
        name: 'Đồ chơi cần câu lông vũ cho mèo',
        slug: makeSlug('Do choi can cau long vu cho meo'),
        description: '<p>Đồ chơi cần câu lông vũ màu sắc bắt mắt, kích thích bản năng săn mồi của mèo. Cần bằng nhựa ABS an toàn, lông vũ tự nhiên có thể thay thế.</p>',
        shortDescription: 'Cần câu lông vũ kích thích bản năng mèo — lông tự nhiên',
        category: catAcc._id,
        thumbnail: 'https://product.hstatic.net/200000316731/product/do-choi-can-cau-long-vu-cho-meo_demo.jpg',
        images: [],
        petType: 'cat', brand: 'PurePaw',
        tags: ['đồ chơi', 'mèo', 'cần câu', 'lông vũ'],
        variants: [{ name: 'Bộ 1 cần + 3 lông', price: 65000, salePrice: 55000, sku: 'TOY-CAT-FTH-1', stock: 60 }],
        isFeatured: false, isActive: true,
      },
      // ── Vệ sinh & Chăm sóc (catCare) ─────────────────────
      {
        name: 'Dầu gội thú cưng Bio-Groom Econo-Groom 355ml',
        slug: makeSlug('Dau goi thu cung Bio Groom Econo Groom 355ml v2'),
        description: '<p>Dầu gội chuyên dụng Bio-Groom cho chó và mèo, làm sạch sâu và làm mềm lông. Hương thơm dịu nhẹ, an toàn cho da nhạy cảm.</p><ul><li>Công thức pH cân bằng</li><li>Không sulfate, không paraben</li><li>Làm sạch sâu, khử mùi hiệu quả</li></ul>',
        shortDescription: 'Dầu gội Bio-Groom pH cân bằng — không sulfate, không paraben',
        category: catCare._id,
        thumbnail: 'https://product.hstatic.net/200000316731/product/dau-goi-cho-cho-bio-groom-econo-groom_72e540ada55b417f9dedc0a75a8a01bc.jpg',
        images: ['https://product.hstatic.net/200000316731/product/dau-goi-cho-cho-bio-groom-econo-groom_72e540ada55b417f9dedc0a75a8a01bc.jpg'],
        brand: 'Bio-Groom', petType: 'other',
        tags: ['dầu gội', 'chăm sóc', 'bio-groom'],
        variants: [
          { name: 'Chai 355ml', price: 180000, salePrice: 155000, sku: 'BG-SHP-355', stock: 30 },
          { name: 'Chai 1L',    price: 420000, salePrice: 380000, sku: 'BG-SHP-1L',  stock: 15 },
        ],
        isFeatured: false, isActive: true,
      },
      {
        name: 'Lược chải lông tự làm sạch cho chó mèo',
        slug: makeSlug('Luoc chai long tu lam sach cho cho meo'),
        description: '<p>Lược chải lông thông minh với nút bấm tự làm sạch, gỡ lông bám vào lược trong 1 giây. Răng inox mềm mại không gây đau cho thú cưng.</p>',
        shortDescription: 'Lược chải lông tự làm sạch — nút bấm tiện lợi, răng inox mềm',
        category: catCare._id,
        thumbnail: 'https://product.hstatic.net/200000316731/product/luoc-chai-long-tu-lam-sach_demo.jpg',
        images: [],
        brand: 'PurePaw', petType: 'other',
        tags: ['lược', 'chải lông', 'grooming', 'chăm sóc'],
        variants: [{ name: 'Loại 1', price: 95000, salePrice: 79000, sku: 'GROOM-COMB-1', stock: 50 }],
        isFeatured: false, isActive: true,
      },
    ];

    await Product.insertMany(products);
    console.log(`📦 Tạo ${products.length} sản phẩm mẫu`);

    // ─── Tạo Blog Posts ────────────────────────────────────────
    const blogs = [
      {
        title: '5 loại thức ăn tốt nhất cho chó con mới về',
        slug: makeSlug('5 loai thuc an tot nhat cho cho con moi ve'),
        excerpt: 'Chó con cần dinh dưỡng đặc biệt để phát triển toàn diện. Cùng PurePaw khám phá 5 loại thức ăn được khuyến nghị nhất bởi các chuyên gia thú y.',
        content: `<h2>Dinh dưỡng cho chó con — tại sao quan trọng?</h2>
<p>Giai đoạn chó con (dưới 12 tháng tuổi) là thời điểm then chốt cho sự phát triển xương, cơ bắp và hệ miễn dịch. Chế độ ăn uống đúng cách trong giai đoạn này ảnh hưởng trực tiếp đến sức khỏe suốt đời của bé.</p>
<h2>1. Thức ăn hạt dành riêng cho chó con</h2>
<p>Các loại hạt dành cho puppy có hàm lượng protein cao hơn (28-32%), canxi và phốt pho được cân bằng để hỗ trợ phát triển xương. LaPaw Gourmet Puppy là lựa chọn được nhiều gia đình tin dùng.</p>
<h2>2. Pate thịt tươi</h2>
<p>Pate có độ ẩm cao giúp chó con dễ tiêu hóa hơn hạt khô. Nên chọn loại có thịt là thành phần đầu tiên trên nhãn.</p>
<h2>3. Thức ăn thô (Raw food)</h2>
<p>Chế độ ăn thô có thể rất tốt nhưng cần tham khảo ý kiến bác sĩ thú y và đảm bảo an toàn vệ sinh thực phẩm.</p>
<h2>Lưu ý khi cho chó con ăn</h2>
<ul><li>Chia nhỏ bữa ăn: 3-4 lần/ngày với chó dưới 3 tháng</li><li>Không cho ăn thức ăn của người lớn</li><li>Luôn có nước sạch bên cạnh</li></ul>`,
        thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        author: admin._id,
        category: 'nutrition',
        tags: ['chó con', 'dinh dưỡng', 'thức ăn', 'puppy'],
        isPublished: true,
        publishedAt: new Date('2026-03-10'),
        viewCount: 245,
      },
      {
        title: 'Cách tắm cho mèo tại nhà — hướng dẫn từng bước',
        slug: makeSlug('Cach tam cho meo tai nha huong dan tung buoc'),
        excerpt: 'Tắm cho mèo không khó như bạn nghĩ! Hãy cùng PurePaw tìm hiểu cách tắm an toàn và hiệu quả để mèo cưng luôn sạch sẽ và thơm tho.',
        content: `<h2>Mèo có cần tắm không?</h2>
<p>Mèo rất sạch sẽ và tự vệ sinh hàng ngày. Tuy nhiên, đôi khi cần tắm khi mèo dính chất bẩn, có vấn đề về da, hoặc mèo lông dài cần chăm sóc thêm.</p>
<h2>Chuẩn bị trước khi tắm</h2>
<ul><li>Chải lông để gỡ rối trước khi tắm</li><li>Chuẩn bị dầu gội chuyên dụng cho mèo (không dùng của người)</li><li>Nước ấm 38-39°C</li><li>Khăn bông mềm và máy sấy ở mức thấp</li></ul>
<h2>Các bước tắm cho mèo</h2>
<ol><li>Làm ướt lông từ từ với nước ấm, tránh mắt và tai</li><li>Thoa dầu gội, massage nhẹ nhàng theo chiều lông</li><li>Xả sạch hoàn toàn dầu gội</li><li>Dùng khăn thấm nước, sau đó sấy khô</li></ol>
<h2>Tần suất tắm</h2>
<p>Mèo lông ngắn: 1-2 tháng/lần. Mèo lông dài: 2-4 tuần/lần.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        author: admin._id,
        category: 'grooming',
        tags: ['mèo', 'tắm', 'chăm sóc', 'grooming'],
        isPublished: true,
        publishedAt: new Date('2026-03-12'),
        viewCount: 189,
      },
      {
        title: 'PurePaw khai trương dịch vụ Spa thú cưng cao cấp',
        slug: makeSlug('PurePaw khai truong dich vu Spa thu cung cao cap'),
        excerpt: 'PurePaw tự hào giới thiệu dịch vụ Grooming Spa cao cấp với đội ngũ groomer chuyên nghiệp 5 năm kinh nghiệm và sản phẩm nhập khẩu từ Mỹ và Châu Âu.',
        content: `<h2>Giới thiệu dịch vụ Spa PurePaw</h2>
<p>PurePaw Pet Shop vui mừng thông báo ra mắt dịch vụ Grooming Spa cao cấp — nơi thú cưng của bạn được chăm sóc như những người bạn VIP.</p>
<h2>Các dịch vụ nổi bật</h2>
<ul><li><strong>Tắm & Sấy khô</strong>: Dùng sản phẩm Bio-Groom nhập khẩu Mỹ</li><li><strong>Cắt tỉa lông nghệ thuật</strong>: Theo yêu cầu hoặc theo giống chó/mèo</li><li><strong>Vệ sinh tai, mắt, móng</strong>: Đầy đủ trọn gói</li><li><strong>Massage thư giãn</strong>: Giảm stress cho thú cưng</li><li><strong>Gói VIP Full Day Spa</strong>: Trải nghiệm hoàn hảo nhất</li></ul>
<h2>Đặt lịch ngay hôm nay</h2>
<p>Liên hệ PurePaw qua hotline hoặc đặt lịch online trên website để nhận ưu đãi 20% cho lần đầu tiên.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        author: admin._id,
        category: 'news',
        tags: ['spa', 'grooming', 'thú cưng', 'dịch vụ', 'khai trương'],
        isPublished: true,
        publishedAt: new Date('2026-03-15'),
        viewCount: 412,
      },
      {
        title: 'Dấu hiệu nhận biết chó mèo bị stress và cách xử lý',
        slug: makeSlug('Dau hieu nhan biet cho meo bi stress va cach xu ly'),
        excerpt: 'Thú cưng cũng bị stress! Hãy học cách nhận biết sớm các dấu hiệu stress ở chó và mèo để can thiệp kịp thời.',
        content: `<h2>Stress ở thú cưng — vấn đề thường bị bỏ qua</h2>
<p>Nhiều chủ nuôi thú cưng không biết rằng chó và mèo cũng có thể bị stress. Nếu không được xử lý kịp thời, stress kéo dài có thể ảnh hưởng nghiêm trọng đến sức khỏe.</p>
<h2>Dấu hiệu stress ở chó</h2>
<ul><li>Liếm chân hoặc cắn lông liên tục</li><li>Sủa hoặc tru nhiều hơn bình thường</li><li>Chán ăn hoặc ăn quá nhiều</li><li>Tiêu chảy, nôn mửa không rõ nguyên nhân</li></ul>
<h2>Dấu hiệu stress ở mèo</h2>
<ul><li>Ẩn nấp, tránh tiếp xúc với người</li><li>Vệ sinh không đúng nơi quy định</li><li>Gãi cào nhiều hơn bình thường</li></ul>
<h2>Cách xử lý</h2>
<p>Tạo không gian an toàn, yên tĩnh cho thú cưng. Duy trì lịch sinh hoạt cố định. Tham khảo ý kiến bác sĩ thú y nếu tình trạng kéo dài.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
        author: admin._id,
        category: 'health',
        tags: ['stress', 'sức khỏe', 'chó', 'mèo', 'chăm sóc'],
        isPublished: true,
        publishedAt: new Date('2026-03-18'),
        viewCount: 156,
      },
    ];

    await Blog.insertMany(blogs);
    console.log(`📝 Tạo ${blogs.length} bài viết blog`);

    // ─── Tạo FAQs ─────────────────────────────────────────────
    const faqs = [
      // General
      { question: 'PurePaw Pet Shop ở đâu và mở cửa lúc mấy giờ?', answer: 'PurePaw Pet Shop tọa lạc tại TP.HCM. Giờ mở cửa: Thứ 2 – Chủ nhật, 8:00 – 20:00. Chúng tôi cũng nhận đặt hàng online 24/7 qua website này!', category: 'general', sortOrder: 1 },
      { question: 'PurePaw có tư vấn miễn phí không?', answer: 'Có! Đội ngũ chuyên gia của PurePaw sẵn sàng tư vấn hoàn toàn miễn phí về dinh dưỡng, chăm sóc và sức khỏe thú cưng. Liên hệ qua hotline hoặc chat trực tiếp trên website.', category: 'general', sortOrder: 2 },
      // Order
      { question: 'Làm thế nào để đặt hàng?', answer: 'Bạn có thể đặt hàng trực tiếp tại cửa hàng, qua website (chọn sản phẩm → thêm vào giỏ → thanh toán), hoặc liên hệ hotline để được hỗ trợ đặt hàng.', category: 'order', sortOrder: 1 },
      { question: 'Tôi có thể hủy đơn hàng sau khi đặt không?', answer: 'Bạn có thể hủy đơn hàng trong vòng 1 giờ sau khi đặt nếu đơn chưa được xác nhận vận chuyển. Vào mục "Đơn hàng của tôi" → chọn đơn → nhấn "Hủy đơn".', category: 'order', sortOrder: 2 },
      // Payment
      { question: 'PurePaw hỗ trợ những hình thức thanh toán nào?', answer: 'PurePaw hỗ trợ: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, Momo, ZaloPay, VNPay. Tất cả giao dịch online đều an toàn và bảo mật.', category: 'payment', sortOrder: 1 },
      { question: 'Thanh toán online có an toàn không?', answer: 'Hoàn toàn an toàn! Chúng tôi sử dụng cổng thanh toán được mã hóa SSL 256-bit. Thông tin thẻ của bạn không được lưu trữ trên hệ thống của chúng tôi.', category: 'payment', sortOrder: 2 },
      // Shipping
      { question: 'Thời gian giao hàng là bao lâu?', answer: 'Nội thành TP.HCM: 2-4 giờ (giao nhanh) hoặc 1-2 ngày. Các tỉnh thành khác: 2-5 ngày làm việc. Đơn hàng từ 300.000đ được miễn phí vận chuyển nội thành.', category: 'shipping', sortOrder: 1 },
      { question: 'Đơn hàng có được đóng gói cẩn thận không?', answer: 'Tất cả đơn hàng được đóng gói cẩn thận với hộp carton và xốp chống va đập. Sản phẩm dễ vỡ hoặc dễ hỏng được bọc thêm lớp bảo vệ đặc biệt.', category: 'shipping', sortOrder: 2 },
      // Booking
      { question: 'Làm thế nào để đặt lịch grooming?', answer: 'Bạn có thể đặt lịch qua website (menu Dịch vụ → Đặt lịch), gọi hotline, hoặc đến trực tiếp cửa hàng. Khuyến khích đặt trước 1-2 ngày để có giờ theo ý muốn.', category: 'booking', sortOrder: 1 },
      { question: 'Dịch vụ grooming bao gồm những gì?', answer: 'Dịch vụ cơ bản: Tắm, sấy, chải lông, vệ sinh tai-mắt-móng. Dịch vụ nâng cao: Cắt tỉa lông theo yêu cầu, massage, mặt nạ dưỡng lông. Xem chi tiết tại trang Dịch vụ.', category: 'booking', sortOrder: 2 },
      // Product
      { question: 'Sản phẩm tại PurePaw có đảm bảo chất lượng không?', answer: '100%! Tất cả sản phẩm tại PurePaw đều là hàng chính hãng, có đầy đủ chứng nhận kiểm dịch và nhập khẩu hợp lệ. Chúng tôi cam kết đổi trả trong 7 ngày nếu sản phẩm có lỗi.', category: 'product', sortOrder: 1 },
      { question: 'Tôi không biết nên chọn thức ăn nào cho thú cưng?', answer: 'Đừng lo! Hãy liên hệ với chuyên gia dinh dưỡng của PurePaw qua hotline hoặc chat. Chúng tôi sẽ tư vấn dựa trên giống, tuổi, cân nặng và tình trạng sức khỏe của thú cưng.', category: 'product', sortOrder: 2 },
    ];

    await FAQ.insertMany(faqs);
    console.log(`❓ Tạo ${faqs.length} câu hỏi FAQ`);

    // ─── Tổng kết ─────────────────────────────────────────────
    console.log('\n🎉 ═══════════════════════════════════════');
    console.log('   SEEDER HOÀN THÀNH THÀNH CÔNG!');
    console.log('═══════════════════════════════════════════');
    console.log('📌 Admin:  admin@purepaw.vn / Admin@123');
    console.log('📌 User:   user@purepaw.vn  / User@123');
    console.log(`📦 Sản phẩm: ${products.length} (${catDog.name}: 4, ${catCat.name}: 4, Phụ kiện: 3, Chăm sóc: 2)`);
    console.log(`📝 Blog: ${blogs.length} bài viết`);
    console.log(`❓ FAQ: ${faqs.length} câu hỏi`);
    console.log('🌐 Truy cập: http://localhost:5000');
    console.log('═══════════════════════════════════════════\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeder thất bại:', error);
    process.exit(1);
  }
};

seed();
