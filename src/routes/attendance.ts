import express from 'express';
import Attendance from '../models/Attendance';
import Office from '../models/Office';
import { authenticate } from '../middleware/auth';
import { isWithinGeofence, calculateDistance } from '../utils/location';

const router = express.Router();

// Check-in endpoint
router.post('/check-in', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Get office details
    const office = await Office.findOne({ 
      organization: 'Tech Company Inc.', 
      isActive: true 
    });

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not configured',
      });
    }

    // Check if user is within office geofence
    const distance = calculateDistance(
      latitude,
      longitude,
      office.location.latitude,
      office.location.longitude
    );
    
    const isWithinOffice = isWithinGeofence(
      latitude,
      longitude,
      office.location.latitude,
      office.location.longitude,
      office.radius
    );

    if (!isWithinOffice) {
      return res.status(400).json({
        success: false,
        message: `You are ${Math.round(distance)}m away from office. Please come within ${office.radius}m radius to check in.`,
        data: {
          distance: Math.round(distance),
          requiredRadius: office.radius,
        },
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today',
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      user: userId,
      date: today,
      checkIn: {
        time: new Date(),
        location: { latitude, longitude },
        isWithinOffice: true,
        distance: Math.round(distance),
      },
      status: 'present',
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: {
        attendance: {
          id: attendance._id,
          checkInTime: attendance.checkIn.time,
          location: attendance.checkIn.location,
          distance: attendance.checkIn.distance,
        },
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Check-out endpoint
router.post('/check-out', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Get today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You need to check in first before checking out',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today',
      });
    }

    // Get office details
    const office = await Office.findOne({ 
      organization: 'Tech Company Inc.', 
      isActive: true 
    });

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not configured',
      });
    }

    // Calculate distance from office
    const distance = calculateDistance(
      latitude,
      longitude,
      office.location.latitude,
      office.location.longitude
    );
    
    const isWithinOffice = isWithinGeofence(
      latitude,
      longitude,
      office.location.latitude,
      office.location.longitude,
      office.radius
    );

    // Update attendance with check-out
    const checkOutTime = new Date();
    attendance.checkOut = {
      time: checkOutTime,
      location: { latitude, longitude },
      isWithinOffice,
      distance: Math.round(distance),
    };

    // Calculate total hours worked
    const timeDiff = checkOutTime.getTime() - attendance.checkIn.time.getTime();
    const totalMinutes = Math.floor(timeDiff / (1000 * 60));
    attendance.totalHours = totalMinutes;

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        attendance: {
          id: attendance._id,
          checkInTime: attendance.checkIn.time,
          checkOutTime: attendance.checkOut.time,
          totalHours: Math.floor(totalMinutes / 60) + 'h ' + (totalMinutes % 60) + 'm',
        },
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get today's attendance status
router.get('/today', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        attendance: attendance ? {
          id: attendance._id,
          checkInTime: attendance.checkIn.time,
          checkOutTime: attendance.checkOut?.time || null,
          status: attendance.status,
          totalHours: attendance.totalHours 
            ? Math.floor(attendance.totalHours / 60) + 'h ' + (attendance.totalHours % 60) + 'm'
            : null,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get attendance history
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    const attendances = await Attendance.find({ user: userId })
      .sort({ date: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Attendance.countDocuments({ user: userId });

    const history = attendances.map(attendance => ({
      id: attendance._id,
      date: attendance.date,
      checkIn: attendance.checkIn.time,
      checkOut: attendance.checkOut?.time || null,
      status: attendance.status,
      totalHours: attendance.totalHours 
        ? Math.floor(attendance.totalHours / 60) + 'h ' + (attendance.totalHours % 60) + 'm'
        : null,
      checkInLocation: {
        isWithinOffice: attendance.checkIn.isWithinOffice,
        distance: attendance.checkIn.distance,
      },
      checkOutLocation: attendance.checkOut ? {
        isWithinOffice: attendance.checkOut.isWithinOffice,
        distance: attendance.checkOut.distance,
      } : null,
    }));

    res.json({
      success: true,
      data: {
        history,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;