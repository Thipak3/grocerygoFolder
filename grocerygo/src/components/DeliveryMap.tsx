'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import { Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Custom marker icons using public CDN icons
const deliveryBoyIcon = L.divIcon({
    html: '<span style="font-size:32px;line-height:1;">🛵</span>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36]
})

const customerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/3177/3177361.png", // House/Customer pin icon
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35]
})

function MapCenterController({ coords }: { coords: [number, number][] }) {
    const map = useMap()
    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true })
        }
    }, [coords, map])
    return null
}

interface DeliveryMapProps {
    customerLat: number
    customerLng: number
    customerName?: string
}

export default function DeliveryMap({ customerLat, customerLng, customerName = "Customer" }: DeliveryMapProps) {
    const [myLocation, setMyLocation] = useState<[number, number] | null>(null)

    useEffect(() => {
        if (navigator.geolocation) {
            // Get initial location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMyLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    console.warn("Error getting location: ", error.message || error)
                },
                { enableHighAccuracy: true }
            )

            // Watch location updates
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setMyLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    console.warn("Error watching location: ", error.message || error)
                },
                { enableHighAccuracy: true }
            )

            return () => navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    const customerLocation: [number, number] = [customerLat, customerLng]
    const mapPoints: [number, number][] = []
    
    if (myLocation) mapPoints.push(myLocation)
    mapPoints.push(customerLocation)

    const handleGoogleMapsRedirect = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`
        window.open(url, '_blank')
    }

    return (
        <div className="relative w-full h-[350px] rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            <MapContainer
                center={customerLocation as LatLngExpression}
                zoom={14}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Customer Marker */}
                <Marker position={customerLocation as LatLngExpression} icon={customerIcon}>
                    <Popup>{customerName}</Popup>
                </Marker>
                
                {/* Delivery Boy Marker */}
                {myLocation && (
                    <Marker position={myLocation as LatLngExpression} icon={deliveryBoyIcon} />
                )}

                {/* Polyline Route */}
                {myLocation && (
                    <Polyline
                        positions={[myLocation, customerLocation] as LatLngExpression[]}
                        color="#10b981"
                        weight={4}
                        dashArray="8, 8"
                        opacity={0.8}
                    />
                )}

                <MapCenterController coords={mapPoints} />
            </MapContainer>

            {/* Navigation Shortcut Overlay */}
            <button
                onClick={handleGoogleMapsRedirect}
                className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 transition-all text-xs z-[999]"
            >
                <Navigation size={14} />
                Navigate in Google Maps
            </button>
        </div>
    )
}
