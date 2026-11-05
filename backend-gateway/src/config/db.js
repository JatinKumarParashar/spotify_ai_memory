const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotify_memory');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB unavailable; continuing without gateway-side audit storage: ${error.message}`);
  }
};

const checkDB = async () => {
  try {
    if (!mongoose.connection.db) {
      return false;
    }
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.warn(`MongoDB health check failed: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
module.exports.checkDB = checkDB;