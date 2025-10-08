import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  checkIn: {
    time: Date;
    location: {
      latitude: number;
      longitude: number;
    };
    isWithinOffice: boolean;
    distance: number;
  };
  checkOut?: {  // Make this optional
    time: Date;
    location: {
      latitude: number;
      longitude: number;
    };
    isWithinOffice: boolean;
    distance: number;
  };
  totalHours?: number;
  status: 'present' | 'absent' | 'half-day';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      time: {
        type: Date,
        required: [true, 'Check-in time is required'],
      },
      location: {
        latitude: {
          type: Number,
          required: [true, 'Check-in latitude is required'],
        },
        longitude: {
          type: Number,
          required: [true, 'Check-in longitude is required'],
        },
      },
      isWithinOffice: {
        type: Boolean,
        required: [true, 'Check-in location validity is required'],
      },
      distance: {
        type: Number,
        required: [true, 'Check-in distance is required'],
      },
    },
    checkOut: {  // Remove required fields, make it optional
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
      isWithinOffice: Boolean,
      distance: Number,
    },
    totalHours: Number,
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      default: 'present',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user and date to prevent duplicates
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);