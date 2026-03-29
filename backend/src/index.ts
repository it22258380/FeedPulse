import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 FeedPulse API running on port ${PORT}`));
};

start();