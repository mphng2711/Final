import dotenv from 'dotenv';
import path from 'path';

// ============================================================
// ENVIRONTMENT CONFIG - 12 Factor App: Yếu tố 3 (Store config in the environment)
// Đảm bảo mọi thứ dựa vào cấu hình môi trường bên ngoài, không mã hóa cứng (hardcode)
// Module này tập hợp và validate sớm mọi required env variables
// ============================================================

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const throwError = (paramName: string): never => {
  throw new Error(`⚠️  Missing required environment variable: ${paramName}`);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  db: {
    uri: process.env.MONGODB_URI || throwError('MONGODB_URI'),
  },

  jwt: {
    secret: process.env.JWT_SECRET || throwError('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || throwError('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
};

export default config;
