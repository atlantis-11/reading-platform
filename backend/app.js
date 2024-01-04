const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes')
require('./config/database');
require('./config/passport');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/users/', userRoutes);

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});