const mongoose = require('mongoose');
const logger = require('./logger');

function gracefulShutdown (signal, server) {
    logger.info(`${signal} reveiced, gracefully shutting down...`);

    server.close(() => {
        logger.info('Express server closed.');

        mongoose.connection.close(false).then(() => {
            logger.info('Mongoose connection closed.');
            process.exit(0);
        });
    });
}

module.exports = gracefulShutdown;