import { MongoClient } from 'mongodb';

const DB_NAME = 'exness';

export const mongodbClient = new MongoClient(process.env.MONGODB_URL!);
await mongodbClient.connect();
export const mongodb = mongodbClient.db(DB_NAME);
export type TypeOfMongoClient = MongoClient;