require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());


app.use('/v3', userRoutes);
app.use('/v1', memoryRoutes);
app.use('/v1', chatRoutes);

app.listen(PORT, () => {
  console.log(`Express API Gateway running on http://localhost:${PORT}`);
});