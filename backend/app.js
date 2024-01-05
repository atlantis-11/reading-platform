const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes')
require('./config/database');
require('./config/passport');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/', authRoutes);

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});