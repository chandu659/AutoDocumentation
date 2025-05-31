import postgres from 'postgres';

// Get the connection string from environment variables
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  console.error('Database connection string is not defined in environment variables');
}

// Create the database connection
const sql = postgres(connectionString as string, {
  ssl: { rejectUnauthorized: false }, // Configure SSL for Supabase
  max: 10, // Maximum number of connections
  connect_timeout: 10, // Connection timeout in seconds
  idle_timeout: 20, // Idle connection timeout in seconds
  debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
});

export default sql;
