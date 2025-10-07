import express from 'express';
import Office from '../models/Office';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get office details (protected route)
router.get('/', authenticate, async (req, res) => {
  try {
    const office = await Office.findOne({ 
      organization: 'Tech Company Inc.', // For now, hardcoded org
      isActive: true 
    });

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found',
      });
    }

    res.json({
      success: true,
      data: {
        office: {
          id: office._id,
          name: office.name,
          address: office.address,
          location: office.location,
          radius: office.radius,
        },
      },
    });
  } catch (error) {
    console.error('Get office error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;