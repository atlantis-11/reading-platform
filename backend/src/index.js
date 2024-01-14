const app = require('./app');
const registerShutdownHandlers = require('./utils/registerShutdownHandlers');
const logger = require('./utils/logger');

require('./config/database');
require('./config/passport');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    logger.info(`Server is up and running on port ${port}`);
});

registerShutdownHandlers(server);