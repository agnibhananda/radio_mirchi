import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string - you'll need to replace this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/radio_mirchi';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Global variable to cache the MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Native MongoDB driver connection
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db('radio_mirchi');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Mongoose connection
let isConnected = false;

export async function connectToMongoose() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}