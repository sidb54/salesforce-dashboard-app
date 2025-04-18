import express, { Router, Request, Response } from 'express';
import passport from 'passport';
import * as salesforceController from '../controllers/salesforce.controller';
import { clearSalesforceConnection } from '../config/salesforce';

const router: Router = express.Router();

// Protect all Salesforce routes with JWT authentication
const authMiddleware = passport.authenticate('jwt', { session: false });

// Get accounts - protected route
router.get('/accounts', authMiddleware, async (req: Request, res: Response) => {
  try {
    await salesforceController.getAccounts(req, res);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout/revoke token route (clear the Salesforce token)
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    clearSalesforceConnection();
    res.status(200).json({ message: 'Salesforce connection cleared successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to clear Salesforce connection' });
  }
});

export default router; 