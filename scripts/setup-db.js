// Script to initialize the database schema using the postgres package
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Get database connection string from environment variables
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  console.error('NEXT_PUBLIC_DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function initializeDatabase() {
  console.log('Setting up database connection...');
  
  // Create SQL client with the postgres package
  const sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    max: 1, // Use only one connection for this script
    idle_timeout: 20,
    connect_timeout: 30,
    debug: true // Enable debug mode to see what's happening
  });
  
  try {
    console.log('Testing database connection...');
    
    // Test the connection with a simple query
    const result = await sql`SELECT current_database() as db_name`;
    console.log(`Connected to database: ${result[0].db_name}`);
    
    // Read the SQL schema file
    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema creation...');
    
    // Execute the schema SQL
    await sql.unsafe(schemaSql);
    console.log('Database schema created successfully');
    
    // Verify the tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Created tables:');
    tables.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await sql.end();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
