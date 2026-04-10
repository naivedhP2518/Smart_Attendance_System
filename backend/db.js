const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "campus_connect";

let db = null;
let client = null;

const connectDB = async () => {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ MongoDB connected → ${DB_NAME}`);
  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log("MongoDB connection closed.");
  }
};

module.exports = { connectDB, getDB, closeDB };
