// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI!;
// if (!MONGODB_URI) {
//   throw new Error("Please define MONGODB_URI");
// }

// type ConnectionObject = {
//   isConnected?: number;
// };

// const connection: ConnectionObject = {};

// const connectDB = async (): Promise<void> => {
//   if (connection.isConnected) {
//     console.log("Already connected to the database");
//     return;
//   }

//   try {
//     const db = await mongoose.connect(MONGODB_URI, {
//       dbName: "database",
//       bufferCommands: false,
//     });

//     connection.isConnected = db.connections[0].readyState;
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

// Use global cache to persist across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse pending connection promise to prevent race conditions
  if (!cached.promise) {
    const opts = {
      dbName: "database",
      bufferCommands: false, // Critical for serverless
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Database connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset on failure
    console.error("❌ Database connection failed:", e);
    throw e; // Don't use process.exit in serverless
  }

  return cached.conn;
}

export default connectDB;
