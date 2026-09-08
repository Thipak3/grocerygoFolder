import axios from 'axios'
import { config } from "./config"
import { log } from "./logger"

async function emitEventHandler(event: string, data: unknown, socketId?: string) {
   try {
      await axios.post(`${config.SOCKET_URL}/notify`, { socketId, event, data })
   } catch (error) {
      log.error("Socket emit error", error)
   }
}
export default emitEventHandler