import mongoose from 'mongoose';
import User from '../models/User';
import Office from '../models/Office';
import { hashPassword } from '../utils/auth';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('🗄️  Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Office.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: adminPassword,
      role: 'admin',
      organization: 'Tech Company Inc.',
    });

    // Create regular user
    const userPassword = await hashPassword('user123');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@company.com',
      password: userPassword,
      role: 'user',
      organization: 'Tech Company Inc.',
    });

    // Create office
    const office = await Office.create({
      name: 'Main Office',
      address: '123 Business District, Nagpur, Maharashtra',
      location: {
        latitude: 21.12880603727172,
        longitude: 79.05808101933607,
      },
      radius: 200,
      organization: 'Tech Company Inc.',
    });

    console.log('🌱 Seed data created successfully!');
    console.log('👨‍💼 Admin:', adminUser.email, '/ admin123');
    console.log('👤 User:', regularUser.email, '/ user123');
    console.log('🏢 Office:', office.name);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data error:', error);
    process.exit(1);
  }
};

seedData();