'use client'
import React, { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'

interface ILocation {
  latitude: number
  longitude: number
}

interface Iprops {
  userLocation: ILocation
  deliveryBoyLocation: ILocation
}

function Recenter({ positions }: { positions: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (positions[0] !== 0 && positions[1] !== 0) {
      map.setView(positions, map.getZoom(), {
        animate: true
      })
    }
  }, [positions, map])
  return null
}

function LiveMap({ userLocation, deliveryBoyLocation }: Iprops) {
  // Default coordinates fallback (Delhi center) if 0 or missing
  const userLat = (userLocation?.latitude && userLocation.latitude !== 0) ? userLocation.latitude : 28.6139
  const userLng = (userLocation?.longitude && userLocation.longitude !== 0) ? userLocation.longitude : 77.2090

  const dbLat = (deliveryBoyLocation?.latitude && deliveryBoyLocation.latitude !== 0) ? deliveryBoyLocation.latitude : (userLat + 0.005)
  const dbLng = (deliveryBoyLocation?.longitude && deliveryBoyLocation.longitude !== 0) ? deliveryBoyLocation.longitude : (userLng + 0.005)

  // Safe Leaflet custom icons with fallback to Leaflet defaults
  const createIcon = (url: string) => {
    try {
      return L.icon({
        iconUrl: url,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      })
    } catch {
      return new L.Icon.Default()
    }
  }

  const deliveryBoyIcon = L.divIcon({
    html: '<span style="font-size:32px;line-height:1;">🛵</span>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36]
  })
  const userIcon = createIcon("https://cdn-icons-png.flaticon.com/128/4821/4821951.png")

  const linePositions: [number, number][] = [
    [dbLat, dbLng],
    [userLat, userLng]
  ]

  const center: [number, number] = [dbLat, dbLng]

  return (
    <div className='w-full h:400px rounded-xl overflow-hidden shadow border relative z-10 min-height:400px'>
      <MapContainer
        center={center as LatLngExpression}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%' }}
        className="w-full h-full"
      >
        <Recenter positions={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>Delivery Address</Popup>
        </Marker>

        <Marker position={[dbLat, dbLng]} icon={deliveryBoyIcon}>
          <Popup>Delivery Partner Location</Popup>
        </Marker>

        <Polyline positions={linePositions} color='green' weight={4} dashArray="8, 8" />
      </MapContainer>
    </div>
  )
}

export default LiveMap