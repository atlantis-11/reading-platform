const express = require('express');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/authRoute');
const errorHandler = require('./middleware/errorHandler');
const pageNotFound = require('./middleware/pageNotFound');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/', authRoute);

app.use(pageNotFound);

app.use(errorHandler);

module.exports = app;