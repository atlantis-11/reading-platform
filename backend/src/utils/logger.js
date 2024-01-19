const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, errors, colorize, json, printf } = winston.format;

let logger = {};

if (process.env.NODE_ENV === 'development') {
    logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss.SSS' }),
            errors({ stack: true }),
            printf(({ timestamp, level, message, stack, ...metadata }) => {
                let format = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(metadata).length > 0) {
                    format += `, ${JSON.stringify(metadata)}`;
                }
                if (stack) {
                    format += `\n${stack}`;
                }
                return format;
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
} else if (process.env.NODE_ENV === 'test')  {
    logger = winston.createLogger({
        silent: true
    });
}

module.exports = logger;