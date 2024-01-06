const app = require('./app');
const gracefulShutdown = require('./utils/gracefulShutdown');
require('./config/database');
require('./config/passport');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});

const terminationSignals = ['SIGINT', 'SIGTERM'];
for (const signal of terminationSignals) {
    process.on(signal, () => gracefulShutdown(signal, server));
}