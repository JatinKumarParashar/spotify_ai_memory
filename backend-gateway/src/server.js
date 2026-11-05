require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
db();

const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', async (req, res) => {
  const mongodb = await db.checkDB();
  res.status(mongodb ? 200 : 503).json({
    status: mongodb ? 'ok' : 'degraded',
    service: 'backend-gateway',
    dependencies: { mongodb },
    timestamp: new Date().toISOString(),
  });
});

app.use('/v3', userRoutes);
app.use('/v1', memoryRoutes);
app.use('/v1', chatRoutes);

app.listen(PORT, () => {
  console.log(`Express API Gateway running on http://localhost:${PORT}`);
});