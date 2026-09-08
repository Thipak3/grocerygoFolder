import { io , Socket } from "socket.io-client"
import { config } from "./config"

let socket:Socket|null=null

export const getSocket = () => {
  if (!socket) {
    const serverUrl = config.SOCKET_URL
    socket = io(serverUrl)
  }
  return socket
}