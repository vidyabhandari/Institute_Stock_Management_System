import dotenv from 'dotenv';
import path from 'path';

// Correctly resolve the path to the .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 3000, // Provide a default port if not set
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET || 'default_jwt_secret', // Optional fallback
};
