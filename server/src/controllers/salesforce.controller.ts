import { Request, Response } from 'express';
import jsforce from 'jsforce';
import { User } from '../models/user.model';

// Get Salesforce authorization URL
export const getSalesforceAuthUrl = async (req: Request, res: Response) => {
  try {
    // Create OAuth2 object for Salesforce
    const oauth2 = new jsforce.OAuth2({
      loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
      clientId: process.env.SF_CLIENT_ID || '',
      clientSecret: process.env.SF_CLIENT_SECRET || '',
      redirectUri: process.env.SF_REDIRECT_URI || 'http://localhost:8000/api/salesforce/callback',
    });

    // Generate authorization URL
    const authUrl = oauth2.getAuthorizationUrl({
      scope: 'api refresh_token',
    });

    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Error generating Salesforce auth URL:', error);
    return res.status(500).json({ message: 'Failed to generate Salesforce auth URL' });
  }
};

// Handle Salesforce OAuth callback
export const handleSalesforceCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const user = req.user as User;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    // Create OAuth2 object for Salesforce
    const oauth2 = new jsforce.OAuth2({
      loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
      clientId: process.env.SF_CLIENT_ID || '',
      clientSecret: process.env.SF_CLIENT_SECRET || '',
      redirectUri: process.env.SF_REDIRECT_URI || 'http://localhost:8000/api/salesforce/callback',
    });

    // Get access and refresh tokens from Salesforce
    const { access_token, refresh_token, instance_url } = await oauth2.requestToken(code as string);

    // Update user record with Salesforce tokens
    await user.update({
      sfAccessToken: access_token,
      sfRefreshToken: refresh_token,
      sfInstanceUrl: instance_url,
    });

    // Redirect to frontend dashboard
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error('Error handling Salesforce callback:', error);
    return res.status(500).json({ message: 'Failed to authenticate with Salesforce' });
  }
};

// Get Salesforce accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    
    // Check if user has Salesforce tokens
    if (!user.sfAccessToken || !user.sfInstanceUrl) {
      return res.status(401).json({ message: 'Salesforce connection not established' });
    }

    // Create connection with stored credentials
    const conn = new jsforce.Connection({
      instanceUrl: user.sfInstanceUrl,
      accessToken: user.sfAccessToken,
    });

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Query Salesforce for accounts with pagination
    const result = await conn.query(
      `SELECT Id, Name, Phone, Website, Industry, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry 
       FROM Account 
       ORDER BY Name 
       LIMIT ${pageSize} 
       OFFSET ${offset}`
    );

    // Get total record count for pagination
    const countResult = await conn.query('SELECT COUNT() FROM Account');
    const totalRecords = countResult.totalSize;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(200).json({
      accounts: result.records,
      pagination: {
        currentPage: page,
        pageSize,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching Salesforce accounts:', error);
    
    // Check if the error is due to an expired token
    if (error && typeof error === 'object' && 'errorCode' in error && error.errorCode === 'INVALID_SESSION_ID') {
      return res.status(401).json({ message: 'Salesforce session expired, please reconnect' });
    }
    
    return res.status(500).json({ message: 'Failed to fetch Salesforce accounts' });
  }
}; 