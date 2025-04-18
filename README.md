# Salesforce Dashboard Application

A full-stack web application for retrieving and displaying Salesforce data.

## Features

- User authentication with JWT and refresh tokens
- Secure password storage with bcrypt
- Connection to Salesforce API
- Display of Salesforce account data
- Responsive UI with React Spectrum
- PostgreSQL database integration

## Tech Stack

### Frontend
- React 
- TypeScript
- React Spectrum (Adobe's UI toolkit)
- React Router for navigation
- Axios for API requests
- React Query for data fetching
- Zustand for state management
- Formik + Yup for form validation

### Backend
- Node.js 
- Express.js
- PostgreSQL with Sequelize ORM
- JWT for authentication
- bcrypt for password hashing
- JSForce for Salesforce API integration

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- Salesforce Developer Account

## Setup Instructions

### Database Setup
1. Create a PostgreSQL database named `salesforce_dashboard`
2. Run the migration scripts in `/server/src/migrations/`

### Backend Configuration
1. Navigate to `/server`
2. Copy `.env.example` to `.env` and fill in your environment variables:
   ```
   PORT=8000
   JWT_SECRET=your_jwt_secret
   DB_NAME=salesforce_dashboard
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   SF_USERNAME=your_salesforce_username
   SF_PASSWORD=your_salesforce_password
   SF_SECURITY_TOKEN=your_salesforce_token
   SF_LOGIN_URL=https://login.salesforce.com
   SF_CLIENT_ID=your_salesforce_client_id
   SF_CLIENT_SECRET=your_salesforce_client_secret
   SF_REDIRECT_URI=http://localhost:8000/api/salesforce/callback
   ```
3. Install dependencies: `npm install`
4. Start the server: `npm run dev`

### Frontend Configuration
1. Navigate to `/client`
2. Copy `.env.example` to `.env` and update as needed:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```
3. Install dependencies: `npm install`
4. Start the application: `npm start`

## Development

### Running in development mode
1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm start`

### Building for production
1. Build backend: `cd server && npm run build`
2. Build frontend: `cd client && npm run build`

## Deployment

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
