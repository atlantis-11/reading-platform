const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, errors, colorize, json } = winston.format;

let logger = {};

if (process.env.NODE_ENV === 'development') {
    logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss.SSS' }),
            errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                if (stack) {
                    return `[${timestamp}] ${level}: ${message}\n${stack}`;
                }
                return `[${timestamp}] ${level}: ${message}`;
            })
        ),
        transports: [new winston.transports.Console()]
    });
} else if (process.env.NODE_ENV === 'production')  {
    logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'error',
        format: combine(
            timestamp(),
            errors({ stack: true }),
            json()
        ),
        transports: [
            new DailyRotateFile({
                filename: 'logs/application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '7d'
            })
        ]
    });
}

module.exports = logger;