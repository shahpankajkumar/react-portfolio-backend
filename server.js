const express = require('express');
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 4000;

require('dotenv').config();
connectDB();

app.use(express.json());

app.use('/api/email', require('./routes/email'));
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
