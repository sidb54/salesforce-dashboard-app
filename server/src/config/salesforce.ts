import * as jsforce from 'jsforce';

interface TokenStorage {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
}

// In-memory token storage
let tokenCache: TokenStorage | null = null;

let sfConnection: jsforce.Connection | null = null;

const saveTokens = (tokens: TokenStorage): void => {
  tokenCache = tokens;
  console.log('Salesforce tokens saved in memory');
};

const loadTokens = (): TokenStorage | null => {
  return tokenCache;
};

// Initialize Salesforce connection using standard username/password login
export const getSalesforceConnection = async (): Promise<jsforce.Connection> => {
  if (sfConnection && sfConnection.accessToken) {
    const tokens = loadTokens();
    // Check if token is still valid (with 5 minute buffer)
    if (tokens && tokens.expiresAt > Date.now() + 300000) {
      return sfConnection;
    }
  }

  const username = process.env.SF_USERNAME;
  const password = process.env.SF_PASSWORD;
  const securityToken = process.env.SF_SECURITY_TOKEN || '';
  const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

  if (!username || !password) {
    throw new Error('Salesforce credentials not configured');
  }

  try {
    // Create connection with standard login
    const conn = new jsforce.Connection({ loginUrl });
    await conn.login(username, password + securityToken);
    
    // Save the connection and token information
    sfConnection = conn;
    
    if (conn.accessToken && conn.instanceUrl) {
      const tokens: TokenStorage = {
        accessToken: conn.accessToken,
        instanceUrl: conn.instanceUrl,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000)
      };
      
      saveTokens(tokens);
    }
    
    console.log('Successfully authenticated with Salesforce');
    return conn;
  } catch (error) {
    console.error('Failed to authenticate with Salesforce:', error);
    throw error;
  }
};

export const clearSalesforceConnection = (): void => {
  tokenCache = null;
  sfConnection = null;
  console.log('Salesforce connection cleared from memory');
}; 