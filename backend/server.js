const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load config
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

// Define routes here later

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));