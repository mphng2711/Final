import mongoose from 'mongoose';
import config from './env';
import logger from '../utils/logger';

// ============================================================
// DATABASE CONNECTION - MongoDB
// Hỗ trợ tái kết nối và log với module Logger
// ============================================================

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.db.uri);
    logger.info(`✅ Tùy chọn Backing Service (Yếu tố 4): Kết nối MongoDB thành công - ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Lỗi kết nối MongoDB: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB bị mất kết nối. Đang thử kết nối lại...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB đã khôi phục kết nối thành công');
    });

  } catch (error) {
    logger.error(`❌ Không thể kết nối đến MongoDB: ${error}`);
    // Crash ngay lập tức nếu thiếu DB (Fail-fast concept) 
    process.exit(1);
  }
};

export default connectDB;
