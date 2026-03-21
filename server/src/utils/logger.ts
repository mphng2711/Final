import winston from 'winston';

// ============================================================
// LOGGER - 12 Factor App: Yếu tố 11 (Coi Logs như một luồng sự kiện)
// Không ghi vào local file, chỉ đẩy ra stdout/stderr để công cụ khác thu gom
// ============================================================

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Luôn ghi ra console (luồng sự kiện chuẩn stdout/stderr)
    new winston.transports.Console()
  ],
});

export default logger;
