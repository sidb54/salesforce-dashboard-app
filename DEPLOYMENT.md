# Deployment Guide

This guide provides instructions for deploying the Salesforce Dashboard application using free hosting options.

## Backend Deployment (Render)

1. **Set up PostgreSQL database**:
   - Go to "New" > "PostgreSQL"
   - Create the DB: `salesforce-dashboard-db`
   - Note your database credentials (URL, user, password)

2. **Set up Web Service**:
   - Add a web service
   - Connect to your GitHub repository
   - Name: `salesforce-dashboard-api`
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm run start`
   - Environment Variables:
     ```
     PORT=10000
     JWT_SECRET=your_secure_random_string
     JWT_EXPIRES_IN=15m
     DB_NAME=from_render_db_settings
     DB_USER=from_render_db_settings
     DB_PASSWORD=from_render_db_settings
     DB_HOST=from_render_db_settings
     SF_LOGIN_URL=https://login.salesforce.com
     SF_USERNAME=your_salesforce_username
     SF_PASSWORD=your_salesforce_password
     SF_SECURITY_TOKEN=your_salesforce_security_token
     SF_CLIENT_ID=your_salesforce_connected_app_client_id
     SF_CLIENT_SECRET=your_salesforce_connected_app_client_secret
     SF_REDIRECT_URI=render_host_name/api/salesforce/callback
     FRONTEND_URL=netlify_app_uri
     ```

## Frontend Deployment (Netlify)

1. **Deploy your frontend**:
   - New site from Git
   - Connect to your repo
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables:
     ```
     REACT_APP_API_URL=https://your-render-app.onrender.com/api
     ```

## Important Cross-Origin Considerations

When deploying across different domains (frontend on Netlify, backend on Render), you need to properly configure CORS and cookies:

1. **Backend CORS settings**:
   ```js
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

2. **Cookie settings for refresh tokens**:
   ```js
   const cookieOptions = {
     httpOnly: true,
     secure: true, // Must be true in production
     sameSite: 'none', // Required for cross-origin
     maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
   };
   ```

3. **Axios settings in frontend**:
   ```js
   axios.defaults.withCredentials = true;
   ```

## Quick troubleshooting

- **CORS issues**: Check that your CORS settings include the correct frontend URL
- **Cookie problems**: Ensure cookies are configured with the right settings (secure, sameSite)
- **Database connection**: Verify database credentials and connection string
- **JWT errors**: Make sure JWT_SECRET is set correctly
- **Salesforce connection issues**: Verify Salesforce credentials and connected app settings 