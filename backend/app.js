const express = require('express');
const connectToMongoDB = require('./config/database');

const app = express();
const port = process.env.PORT;

connectToMongoDB();

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});