const express = require('express');
const cookieParser = require('cookie-parser');

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const bookRoute = require('./routes/bookRoute');

const errorHandler = require('./middleware/errorHandler');
const pageNotFound = require('./middleware/pageNotFound');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/', authRoute);
app.use('/api/users/', userRoute);
app.use('/api/books/', bookRoute);

app.use(pageNotFound);

app.use(errorHandler);

module.exports = app;