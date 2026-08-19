'use client'
import { getSocket } from '@/lib/socket'
import { useEffect } from 'react'

function GeoUpdate({ userId }: { userId: string }) {
    useEffect(() => {
        if (!userId) return
        
        const socket = getSocket()
        socket.emit("identity", userId)

        if (!navigator.geolocation) return

        const watcher = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            console.log("GeoUpdate success:", latitude, longitude)
            socket.emit("update-location", {
              userId,
              latitude,
              longitude
            })
          },  
          (error) => {
            console.warn("GeoUpdate warning:", error.message || error)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )

        return () => navigator.geolocation.clearWatch(watcher)
    }, [userId])

    return null
}

export default GeoUpdate
