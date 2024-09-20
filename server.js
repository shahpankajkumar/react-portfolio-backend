const express = require('express');
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 4000;

require('dotenv').config();
connectDB();

app.use(express.json());

app.use('/api/email', require('./routes/email'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
