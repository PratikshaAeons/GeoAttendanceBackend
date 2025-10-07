import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import officeRoutes from './routes/office';
import attendanceRoutes from './routes/attendance';
import userRoutes from './routes/user';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/user', userRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GeoAttend Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route is working!'
  });
});

// We'll add proper 404 handler later after server runs
// For now, let's get the basic server working

export default app;