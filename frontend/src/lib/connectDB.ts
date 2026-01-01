import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

const connectDB = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: "database",
      bufferCommands: false,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
