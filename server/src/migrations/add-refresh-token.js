const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'salesforce_dashboard',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

async function migrateRefreshToken() {
  try {
    // Check if the column already exists
    const [results] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'refreshToken'"
    );

    if (results.length === 0) {
      console.log('Adding refreshToken column to users table...');
      
      // Add the column
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN \"refreshToken\" TEXT DEFAULT NULL"
      );
      
      console.log('Migration successful: Added refreshToken column to users table');
    } else {
      console.log('Column refreshToken already exists in users table');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
migrateRefreshToken(); 