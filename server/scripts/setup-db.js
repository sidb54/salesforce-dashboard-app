const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to postgres to create the database
  const adminClient = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if the database already exists
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'salesforce_dashboard']
    );
    
    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Creating database "${process.env.DB_NAME || 'salesforce_dashboard'}"...`);
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME || 'salesforce_dashboard'}`);
      console.log(`Database "${process.env.DB_NAME || 'salesforce_dashboard'}" created successfully`);
    } else {
      console.log(`Database "${process.env.DB_NAME || 'salesforce_dashboard'}" already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await adminClient.end();
  }
}

createDatabase().then(() => {
  console.log('Database setup complete');
}).catch(err => {
  console.error('Database setup failed:', err);
}); 