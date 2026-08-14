import dns from "dns"
import mongoose from "mongoose"

// Fixes mongodb+srv DNS failures on some Windows networks
dns.setDefaultResultOrder("ipv4first")

const mongodbUrl = process.env.MONGODB_URL

if (!mongodbUrl) {
  throw new Error("MONGODB_URL is missing in .env.local")
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUrl, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      })
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
