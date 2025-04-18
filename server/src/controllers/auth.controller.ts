import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import crypto from 'crypto';

const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const refreshToken = generateRefreshToken();

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      refreshToken,
    });

    const token = generateToken(user);

    // Set HTTP-only cookie with refresh token
    setRefreshTokenCookie(res, refreshToken);

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

    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

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
    console.log('Headers:', req.headers);
    console.log('Cookies received:', req.cookies);
    
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token found in cookies' });
    }

    // Find user with this refresh token
    const user = await User.findOne({ where: { refreshToken } });
    
    if (!user) {
      // Clear invalid cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/'
      });
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
    // Clear refresh token cookie with proper options
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/'
    });
    
    if (req.user) {
      const user = req.user as User;
      user.refreshToken = '';
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
    secure: true, // Always use secure cookies with Netlify
    sameSite: 'none' as const, // Must be 'none' for cross-origin requests
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/' // Ensure cookie is available on all paths
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