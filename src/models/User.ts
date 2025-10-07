import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript interface for User
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  organization: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB schema for User
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      default: 'Default Organization',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;