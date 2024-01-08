const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => { logger.info('Connected to MongoDB'); })
    .catch((error) => {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    });