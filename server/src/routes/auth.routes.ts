import express, { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import passport from 'passport';

const router: Router = express.Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      await authController.register(req, res);
    } catch (error) {
      console.error('Register route error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      await authController.login(req, res);
    } catch (error) {
      console.error('Login route error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }
);

// Check if user is authenticated
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      await authController.getCurrentUser(req, res);
    } catch (error) {
      console.error('Get current user route error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  }
);

// Refresh token route
router.post(
  '/refresh-token',
  async (req: Request, res: Response) => {
    try {
      await authController.refreshAccessToken(req, res);
    } catch (error) {
      console.error('Refresh token route error:', error);
      res.status(500).json({ message: 'Failed to refresh token' });
    }
  }
);

// Logout route
router.post(
  '/logout',
  async (req: Request, res: Response) => {
    try {
      await authController.logout(req, res);
    } catch (error) {
      console.error('Logout route error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }
);

export default router; 