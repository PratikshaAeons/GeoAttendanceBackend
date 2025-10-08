import mongoose from 'mongoose';
import Attendance from '../models/Attendance';
import dotenv from 'dotenv';

dotenv.config();

const clearAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('🗄️  Connected to MongoDB');

    // Clear all attendance records
    const result = await Attendance.deleteMany({});
    console.log(`🧹 Cleared ${result.deletedCount} attendance records`);

    console.log('✅ Attendance data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear attendance error:', error);
    process.exit(1);
  }
};

clearAttendance();