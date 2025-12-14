import { MongoClient } from 'mongodb';

const DB_NAME = 'exness';

export const mongodbClient = new MongoClient(process.env.MONGODB_URL!, {
  ssl: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
});

await mongodbClient.connect();
export const mongodb = mongodbClient.db(DB_NAME);
export type TypeOfMongoClient = MongoClient;