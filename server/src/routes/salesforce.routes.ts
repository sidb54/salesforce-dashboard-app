import express, { Router, Request, Response } from 'express';
import passport from 'passport';
import * as salesforceController from '../controllers/salesforce-controller';

const router: Router = express.Router();

// Protect all Salesforce routes with JWT authentication
router.use(passport.authenticate('jwt', { session: false }));

// Get accounts
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    await salesforceController.getAccounts(req, res);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 