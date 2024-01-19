module.exports = async () => {
    const mongod = global.__MONGOD__;
    await mongod.stop();
};