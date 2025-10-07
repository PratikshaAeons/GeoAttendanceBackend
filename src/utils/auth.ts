import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};