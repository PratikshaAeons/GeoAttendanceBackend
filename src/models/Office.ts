import mongoose, { Document, Schema } from 'mongoose';

export interface IOffice extends Document {
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  organization: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Office name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Office address is required'],
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    radius: {
      type: Number,
      required: [true, 'Radius is required'],
      default: 200, // meters
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
    timestamps: true,
  }
);

export default mongoose.model<IOffice>('Office', OfficeSchema);