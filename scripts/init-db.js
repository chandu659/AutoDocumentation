// Script to initialize the database schema
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Get database connection string from environment variables
const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!dbUrl) {
  console.error('NEXT_PUBLIC_DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the connection string manually to handle special characters
function parseConnectionString(url) {
  try {
    // Extract the basic parts using regex to avoid URL parsing issues
    const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):([^/]+)\/(.+)$/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('Invalid PostgreSQL connection string format');
    }
    
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5]
    };
  } catch (error) {
    console.error('Error parsing connection string:', error.message);
    throw error;
  }
}

async function initializeDatabase() {
  let client = null;
  
  try {
    console.log('Parsing database connection details...');
    const config = parseConnectionString(dbUrl);
    
    console.log(`Connecting to database ${config.database} on ${config.host}:${config.port} as ${config.user}`);
    
    // Create client with explicit parameters
    client = new Client({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: config.database,
      ssl: { rejectUnauthorized: false }
    });
    
    // Connect to the database
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database successfully');
    
    // Read the SQL schema file
    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema creation...');
    await client.query(schemaSql);
    console.log('Database schema created successfully');
    
    // Verify the tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
