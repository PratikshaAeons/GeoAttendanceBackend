import express from 'express';
import { authenticate } from '../middleware/auth';
import User, { IUser } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const router = express.Router();

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user - explicitly type it as IUser
    const user: IUser | null = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token - now TypeScript knows user._id is a string
    const token = generateToken(user._id.toString(), user.role);

    // Return user info (without password) and token
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;