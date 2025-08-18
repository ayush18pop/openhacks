import { MongoClient, Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

const globalForMongo = global as unknown as {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
};

export async function getMongoDb(): Promise<Db> {
  if (globalForMongo._mongoDb) return globalForMongo._mongoDb as Db;
  if (db) return db;

  const uri = process.env.MONGODB_URI as string | undefined;
  const dbName = process.env.MONGODB_DB as string | undefined;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!dbName) throw new Error("MONGODB_DB is not set");

  client = await MongoClient.connect(uri, {});
  db = client.db(dbName);

  if (process.env.NODE_ENV !== "production") {
    globalForMongo._mongoClient = client;
    globalForMongo._mongoDb = db;
  }
  return db;
}
