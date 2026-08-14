import { io , Socket } from "socket.io-client"

let socket:Socket|null=null

export const getSocket = () => {
  if (!socket) {
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000"
    socket = io(serverUrl)
  }
  return socket
}