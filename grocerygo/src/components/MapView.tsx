'use client'

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import axios from 'axios'
import { motion } from 'motion/react'
import { LocateFixed, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface MapViewProps {
    position: [number, number] | null
    setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>
    setAdress: React.Dispatch<React.SetStateAction<{
        fullName: string
        mobile: string
        city: string
        state: string
        pinCode: string
        fullAddress: string
    }>>
    searchQuery: string
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

function DraggableMarker({
    position,
    setPosition,
}: {
    position: [number, number]
    setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>
}) {
    const map = useMap()
    useEffect(() => {
        map.setView(position as LatLngExpression, 15, { animate: true })
    }, [position, map])

    return (
        <Marker
            draggable={true}
            icon={markerIcon}
            position={position as LatLngExpression}
            eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                    const marker = e.target as L.Marker
                    const { lat, lng } = marker.getLatLng()
                    setPosition([lat, lng])
                }
            }}
        />
    )
}

export default function MapView({
    position,
    setPosition,
    setAdress,
    searchQuery,
    setSearchQuery
}: MapViewProps) {
    const [searchLoading, setSearchLoading] = useState(false)

    const handleSearchQuery = async () => {
        if (!searchQuery) return
        setSearchLoading(true)
        try {
            const provider = new OpenStreetMapProvider()
            const results = await provider.search({ query: searchQuery })
            if (results && results.length > 0) {
                setPosition([results[0].y, results[0].x])
            } else {
                alert("Location not found!")
            }
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
            }, (err) => {
                console.log('location error', err)
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        }
    }

    useEffect(() => {
        const fetchAddress = async () => {
            if (!position) return
            try {
                const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`)
                const addr = result.data.address
                setAdress(prev => ({
                    ...prev,
                    city: addr.city || addr.town || addr.village || "",
                    state: addr.state || "",
                    pinCode: addr.postcode || "",
                    fullAddress: result.data.display_name || ""
                }))
            } catch (error) {
                console.log(error)
            }
        }
        fetchAddress()
    }, [position, setAdress])

    if (!position) return null

    return (
        <div className="relative w-full h-full">
            <div className='flex gap-2 mb-4 absolute top-4 left-4 right-4 z-[999] bg-white p-2 rounded-2xl shadow-lg border border-gray-100'>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchQuery()}
                    placeholder='Search city or area...'
                    className='flex-1 border-none focus:ring-0 px-3 py-2 text-sm outline-none text-gray-800'
                />
                <button
                    onClick={handleSearchQuery}
                    className='bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition-all font-medium flex items-center justify-center min-w-[80px]'
                >
                    {searchLoading ? <Loader2 size={16} className='animate-spin' /> : "Search"}
                </button>
            </div>

            <MapContainer
                center={position as LatLngExpression}
                zoom={13}
                scrollWheelZoom={true}
                className='w-full h-full'
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={position} setPosition={setPosition} />
            </MapContainer>

            <motion.button
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.3 }}
                className='absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-[999]'
                onClick={handleCurrentLocation}
            >
                <LocateFixed size={22} />
            </motion.button>
        </div>
    )
}
