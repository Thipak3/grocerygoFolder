import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
import { log } from "./logger.js"
dotenv.config()

if (process.env.NODE_ENV === "production" && !process.env.NEXT_BASE_URL) {
  throw new Error("FATAL: NEXT_BASE_URL is missing in environment variables.");
}
const NEXT_BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:3000";

const app = express()
app.use(express.json())
const server = http.createServer(app)
const port = process.env.PORT || 5000

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})
io.on("connection", (socket) => {
  log.info("user connected", socket.id)

  socket.on("identity", async (userId) => {
    log.info("identity received", userId)
    try {
      await axios.post(`${NEXT_BASE_URL}/api/socket/connect`, { userId, socketId: socket.id })
    } catch (err) {
      log.error("socket connect err", err)
    }
  })

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    log.info(`Updating location for user ${userId}`, { latitude, longitude })
    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    }

    try {
      await axios.post(`${NEXT_BASE_URL}/api/socket/update-location`, { userId, location })
    } catch (err) {
      log.error("location update err", err)
    }

    io.emit("update-deliveryBoy-location", { userId, location })
  })

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
    const rooms = [...socket.rooms].join(", ")
    log.info(`[Server] Socket ${socket.id} joined room: "${roomId}"`, { rooms })
  })

  socket.on("send-message", async (message) => {
    log.info(`[Server] Received send-message from ${socket.id}`, message)
    const roomId = message.roomId
    const socketsInRoom = await io.in(roomId).fetchSockets()
    log.info(`[Server] Sockets in room "${roomId}"`, socketsInRoom.map(s => s.id))
    try {
      await axios.post(`${NEXT_BASE_URL}/api/chat/save`, message)
    } catch (err) {
      log.error("Save message err", err)
    }
    io.to(roomId).emit("send-message", message)
    log.info(`[Server] Emitted send-message to room "${roomId}"`)
  })
  socket.on("disconnect", () => {
    log.info("user disconnected", socket.id)
  })
})

app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body
  if (socketId) {
    io.to(socketId).emit(event, data)
  }
  else {
    io.emit(event, data)
  }
  return res.status(200).json({ "success": true })

})

server.listen(port, () => {
  log.info("server started at", port)
})