const logger = require('./logger');
const mongoose = require('mongoose');

function gracefulShutdown(exitCode, reason, server) {
    return (error) => {
        if (exitCode !== 0) {
            logger.error(error);
        }
        
        logger[exitCode === 0 ? 'info' : 'error'](`Gracefully shutting down, reason: ${reason}`);

        server.close(() => {
            logger.info('Express server closed');

            mongoose.connection.close(false).then(() => {
                logger.info('Mongoose connection closed');
                process.exit(exitCode);
            });
        });

        setTimeout(() => {
            process.exit(exitCode);
        }, 3000);
    };
}

function registerShutdownHandlers(server) {
    process.on('uncaughtException', gracefulShutdown(1, 'Uncaught Exception', server));
    process.on('unhandledRejection', gracefulShutdown(1, 'Unhandled Rejection', server));
    process.on('SIGTERM', gracefulShutdown(0, 'SIGTERM', server));
    process.on('SIGINT', gracefulShutdown(0, 'SIGINT', server));
}

module.exports = registerShutdownHandlers;