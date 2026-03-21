import mongoose, { Schema, Document } from 'mongoose';

// ============================================================
// PRODUCT MODEL - Sản phẩm thú cưng
// Quản lý bởi Admin, xem bởi User
// ============================================================

export interface IProductVariant {
  name: string;        // Ví dụ: "Gói 1kg", "Gói 5kg"
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  thumbnail: string;
  variants: IProductVariant[];
  brand?: string;
  petType?: string;           // "dog" | "cat" | "other"
  tags: string[];
  averageRating: number;
  totalReviews: number;
  totalSold: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: {
      type: String,
      required: [true, 'Tên biến thể là bắt buộc'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Giá khuyến mãi không được âm'],
      validate: {
        validator: function (this: IProductVariant, val: number) {
          return !val || val < this.price;
        },
        message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
      },
    },
    sku: {
      type: String,
      required: [true, 'Mã SKU là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: [true, 'Số lượng tồn kho là bắt buộc'],
      min: [0, 'Số lượng tồn kho không được âm'],
      default: 0,
    },
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả sản phẩm là bắt buộc'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Mô tả ngắn không được vượt quá 300 ký tự'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục sản phẩm là bắt buộc'],
    },
    images: {
      type: [String],
      validate: {
        validator: (val: string[]) => val.length <= 10,
        message: 'Tối đa 10 ảnh sản phẩm',
      },
    },
    thumbnail: {
      type: String,
      required: [true, 'Ảnh đại diện sản phẩm là bắt buộc'],
    },
    variants: {
      type: [ProductVariantSchema],
      validate: {
        validator: (val: IProductVariant[]) => val.length >= 1,
        message: 'Sản phẩm phải có ít nhất 1 biến thể',
      },
    },
    brand: {
      type: String,
      trim: true,
    },
    petType: {
      type: String,
      enum: {
        values: ['dog', 'cat', 'other'],
        message: 'Loại thú cưng phải là "dog", "cat" hoặc "other"',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes tối ưu query
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ petType: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ name: 'text', tags: 'text' }); // Full-text search

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
