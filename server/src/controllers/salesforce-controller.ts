import { Request, Response } from 'express';
import * as jsforce from 'jsforce';

// Salesforce connection singleton
let sfConnection: jsforce.Connection | null = null;

// Initialize Salesforce connection
const initSalesforceConnection = async (): Promise<jsforce.Connection> => {
  if (sfConnection && sfConnection.accessToken) {
    return sfConnection;
  }

  const username = process.env.SF_USERNAME;
  const password = process.env.SF_PASSWORD;
  const securityToken = process.env.SF_SECURITY_TOKEN || '';
  const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

  if (!username || !password) {
    throw new Error('Salesforce credentials not configured');
  }

  const conn = new jsforce.Connection({ loginUrl });

  try {
    await conn.login(username, password + securityToken);
    sfConnection = conn;
    console.log('Successfully authenticated with Salesforce');
    return conn;
  } catch (error) {
    console.error('Failed to authenticate with Salesforce:', error);
    throw error;
  }
};

// Get Salesforce accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    // Validate that user is authenticated (JWT token is valid)
    // This is handled by the passport middleware in the route

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Get Salesforce connection
    const conn = await initSalesforceConnection();

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
      // Reset connection so it will be re-established on next request
      sfConnection = null;
      return res.status(500).json({ message: 'Salesforce session expired. Retry your request.' });
    }
    
    return res.status(500).json({ message: 'Failed to fetch Salesforce accounts' });
  }
}; 