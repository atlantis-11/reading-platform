const mongoose = require('mongoose');

async function connectToDb() {
    await mongoose.connect(process.env.MONGODB_URI + `db-${+new Date()}`);
}

async function dropDbAndDisconnect() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}

module.exports = {
    connectToDb,
    dropDbAndDisconnect
};