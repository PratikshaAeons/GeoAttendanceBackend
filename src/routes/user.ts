import express from 'express';
import { authenticate } from '../middleware/auth';
import Attendance from '../models/Attendance';

const router = express.Router();

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Calculate stats for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyAttendances = await Attendance.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const presentDays = monthlyAttendances.filter(a => a.status === 'present' && a.checkOut).length;
    const halfDays = monthlyAttendances.filter(a => a.status === 'half-day').length;
    const absentDays = monthlyAttendances.length - presentDays - halfDays;

    // Calculate total working hours this month (only completed days with check-out)
    const totalMinutes = monthlyAttendances.reduce((total, attendance) => {
      return total + (attendance.totalHours || 0);
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    res.json({
      success: true,
      data: {
        stats: {
          present: presentDays,
          absent: absentDays,
          halfDays: halfDays,
          totalWorkingHours: `${totalHours}h ${remainingMinutes}m`,
          totalWorkingMinutes: totalMinutes,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;