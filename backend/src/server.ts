import dotenv from 'dotenv';
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';

// Load environment variables from .env file
dotenv.config();

let server: Server;

async function main() {
  try {
    // Ensure the database URL is loaded correctly
    if (!config.database_url) {
      throw new Error("Database URL is not defined in the environment variables.");
    }

    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);

    // Start the server
    server = app.listen(config.port, () => {
      console.log(`App is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log("Error during initialization:", err);
  }
}

main();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`😈 Unhandled Rejection detected, shutting down...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`😈 Uncaught Exception detected, shutting down...`, err);
  process.exit(1);
});