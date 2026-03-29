import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model';

const seedAdmin = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@feedpulse.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    } else {
      await User.create({ email: adminEmail, password: adminPassword, role: 'admin' });
      console.log(`✅ Admin created: ${adminEmail}`);
    }

    await mongoose.disconnect();
    console.log('✅ Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedAdmin();
