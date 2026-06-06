const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0;
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production' && retryCount < MAX_RETRIES) {
      retryCount++;
      console.error(`Retry ${retryCount}/${MAX_RETRIES}. Retrying in 5 seconds...`);
      setTimeout(connectDB, 5000);
    } else {
      console.error('MongoDB connection failed. Exiting.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;