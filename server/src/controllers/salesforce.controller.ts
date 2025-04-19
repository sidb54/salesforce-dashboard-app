import { Request, Response } from 'express';
import * as jsforce from 'jsforce';
import { getSalesforceConnection, clearSalesforceConnection } from '../config/salesforce';

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Function to execute Salesforce queries
    const executeQueries = async (connection: jsforce.Connection) => {
      // Query Salesforce for accounts with pagination
      const accountsResult = await connection.query(
        `SELECT Id, Name, Phone, Website, Industry, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry 
         FROM Account 
         ORDER BY Name 
         LIMIT ${pageSize} 
         OFFSET ${offset}`
      );

      // Get total record count for pagination
      const countResult = await connection.query('SELECT COUNT() FROM Account');
      
      return {
        accounts: accountsResult,
        count: countResult
      };
    };

    let conn = await getSalesforceConnection();

    let queryResults;

    try {
      queryResults = await executeQueries(conn);
    } catch (queryError: any) {
      // Check if token expired
      if (queryError && typeof queryError === 'object' && 'errorCode' in queryError && 
          queryError.errorCode === 'INVALID_SESSION_ID') {
        
        // Clear the connection and get a new one
        console.log('Salesforce token expired, refreshing connection automatically');
        clearSalesforceConnection();
        conn = await getSalesforceConnection();
        
        // Retry the query with the new connection
        queryResults = await executeQueries(conn);
      } else {
        throw queryError;
      }
    }

    const totalRecords = queryResults!.count.totalSize;
    const totalPages = Math.ceil(totalRecords/pageSize);

    return res.status(200).json({
      accounts: queryResults!.accounts.records,
      pagination: {
        currentPage: page,
        pageSize,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching Salesforce accounts:', error);
    return res.status(500).json({ message: 'Failed to fetch Salesforce accounts' });
  }
}; 