import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
dotenv.config()
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
  console.log("user connected", socket.id)

  socket.on("identity", async (userId) => {
    console.log(userId)
    try {
      await axios.post(`${process.env.NEXT_BASE_URL || 'http://localhost:3000'}/api/socket/connect`, { userId, socketId: socket.id })
    } catch (err) {
      console.error("socket connect err:", err.message)
    }
  })

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    console.log(`Updating location for user ${userId}:`, { latitude, longitude })
    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    }

    try {
      await axios.post(`${process.env.NEXT_BASE_URL || 'http://localhost:3000'}/api/socket/update-location`, { userId, location })
    } catch (err) {
      console.error("location update err:", err.message)
    }

    io.emit("update-deliveryBoy-location", { userId, location })
  })

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
    const rooms = [...socket.rooms].join(", ")
    console.log(`[Server] Socket ${socket.id} joined room: "${roomId}" | All rooms: [${rooms}]`)
  })

  socket.on("send-message", async (message) => {
    console.log(`[Server] Received send-message from ${socket.id}:`, JSON.stringify(message))
    const roomId = message.roomId
    const socketsInRoom = await io.in(roomId).fetchSockets()
    console.log(`[Server] Sockets in room "${roomId}": ${socketsInRoom.map(s => s.id).join(", ") || "NONE"}`)
    try {
      await axios.post(`${process.env.NEXT_BASE_URL || 'http://localhost:3000'}/api/chat/save`, message)
    } catch (err) {
      console.error("Save message err:", err.message)
    }
    io.to(roomId).emit("send-message", message)
    console.log(`[Server] Emitted send-message to room "${roomId}"`)
  })
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
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
  console.log("server started at", port)
})