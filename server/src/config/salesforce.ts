import * as jsforce from 'jsforce';

// Token storage interface
interface TokenStorage {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number; // timestamp when token expires
}

// In-memory token storage (singleton)
let tokenCache: TokenStorage | null = null;

// Singleton connection
let sfConnection: jsforce.Connection | null = null;

// Save tokens to memory
const saveTokens = (tokens: TokenStorage): void => {
  tokenCache = tokens;
  console.log('Salesforce tokens saved in memory');
};

// Load tokens from memory
const loadTokens = (): TokenStorage | null => {
  return tokenCache;
};

// Initialize Salesforce connection using OAuth2 Resource Owner Password Credential flow
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
  const clientId = process.env.SF_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET;
  const redirectUri = process.env.SF_REDIRECT_URI;
  const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

  if (!username || !password || !clientId || !clientSecret) {
    throw new Error('Salesforce credentials not configured');
  }

  // Create connection with OAuth2 configuration
  const conn = new jsforce.Connection({
    loginUrl,
    oauth2: {
      clientId,
      clientSecret,
      redirectUri
    }
  });

  try {
    const userInfo = await conn.login(username, password + securityToken);
        sfConnection = conn;
    
    if (conn.accessToken && conn.instanceUrl) {
      const tokens: TokenStorage = {
        accessToken: conn.accessToken,
        instanceUrl: conn.instanceUrl,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // Default 2-hour expiry
      };
      
      saveTokens(tokens);
    }
    
    console.log('Successfully authenticated with Salesforce OAuth2');
    console.log(`User ID: ${userInfo.id}`);
    console.log(`Org ID: ${userInfo.organizationId}`);
    
    return conn;
  } catch (error) {
    console.error('Failed to authenticate with Salesforce:', error);
    
    // Try standard login as fallback if OAuth fails
    try {
      console.log('Attempting standard login as fallback...');
      const standardConn = new jsforce.Connection({ loginUrl });
      await standardConn.login(username, password + securityToken);
      
      // Save the connection and token information
      sfConnection = standardConn;
      
      if (standardConn.accessToken && standardConn.instanceUrl) {
        const tokens: TokenStorage = {
          accessToken: standardConn.accessToken,
          instanceUrl: standardConn.instanceUrl,
          expiresAt: Date.now() + (2 * 60 * 60 * 1000) // Default 2-hour expiry
        };
        
        saveTokens(tokens);
      }
      
      console.log('Successfully authenticated with Salesforce using standard login');
      return standardConn;
    } catch (fallbackError) {
      console.error('Fallback authentication also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Clear tokens and reset connection
export const clearSalesforceConnection = (): void => {
  tokenCache = null;
  sfConnection = null;
  console.log('Salesforce connection cleared from memory');
}; 