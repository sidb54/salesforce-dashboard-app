import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import crypto from 'crypto';

// Generate refresh token
const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken();

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      refreshToken,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie with refresh token
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and token
    return res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate new refresh token
    const refreshToken = generateRefreshToken();
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie with refresh token
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and token
    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is already attached to the request by passport middleware
    const user = req.user as User;

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Failed to get user data' });
  }
};

// Refresh token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Find user with this refresh token
    const user = await User.findOne({ where: { refreshToken } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const token = generateToken(user);

    // Return new access token
    return res.status(200).json({
      token,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Failed to refresh token' });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // If user is authenticated, clear their refresh token
    if (req.user) {
      const user = req.user as User;
      user.refreshToken = ''; // Using empty string instead of null
      await user.save();
    }
    
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
};

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res: Response, token: string): void => {
  // Cookie options
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  
  // Set cookie
  res.cookie('refreshToken', token, cookieOptions);
};

// Generate JWT token helper
const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'default_jwt_secret';
  const expiresIn = '15m'; // Short-lived token (15 minutes)

  return jwt.sign(payload, secret, { expiresIn });
}; 