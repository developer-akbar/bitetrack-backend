require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
connectDB(); // connect to MongoDB

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const foodRoutes = require('./routes/food');
app.use('/api/food', foodRoutes);

const burnRoutes = require('./routes/burn');
app.use('/api/burn', burnRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
