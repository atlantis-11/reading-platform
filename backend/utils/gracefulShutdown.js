const mongoose = require('mongoose');

function gracefulShutdown (signal, server) {
    console.log(`${signal} reveiced, gracefully shutting down...`);

    server.close(() => {
        console.log('Express server closed.');

        mongoose.connection.close(false).then(() => {
            console.log('Mongoose connection closed.');
            process.exit(0);
        });
    });
}

module.exports = gracefulShutdown;