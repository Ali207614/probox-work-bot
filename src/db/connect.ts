import mongoose from 'mongoose';
import { config } from '../config';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB ulandi!');
  } catch (error) {
    console.error('MongoDB ulanish xatosi:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB uzildi!');
});
mongoose.connection.on('error', (error) => {
  console.error('MongoDB xatosi:', error);
});
