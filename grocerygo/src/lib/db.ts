import dns from "dns"
import mongoose from "mongoose"

// Fixes mongodb+srv DNS failures on Windows local development
if (process.platform === "win32") {
  dns.setDefaultResultOrder("ipv4first")
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
  const mongodbUrl = process.env.MONGODB_URL
  if (!mongodbUrl) {
    throw new Error("MONGODB_URL is missing in environment variables")
  }

  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    const connectOptions: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
    }
    if (process.platform === "win32") {
      connectOptions.family = 4
    }

    cached.promise = mongoose
      .connect(mongodbUrl, connectOptions)
      .then((conn) => conn.connection)
  }
  try {
    const conn = await cached.promise
    cached.conn = conn
    return conn
  } catch (error) {
    cached.promise = null
    console.error("MongoDB connection failed:", error)
    throw error
  }
}

export default connectDb
