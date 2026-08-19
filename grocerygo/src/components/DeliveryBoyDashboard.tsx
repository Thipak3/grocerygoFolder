'use client'

import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

import dynamic from 'next/dynamic'
const LiveMap = dynamic(() => import('./liveMap'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-[400px] rounded-xl border bg-gray-100 flex items-center justify-center text-gray-500 font-medium'>
      Loading Map...
    </div>
  )   
})
import DeliveryChat from './DeliveryChat'

import { Loader } from 'lucide-react'

interface ILocation {
  latitude: number,
  longitude: number
}

interface IAssignment {
  _id: string
  order: {
    _id: string
    address?: {
      fullAddress?: string
      latitude?: number
      longitude?: number
    }
    deliveryOtpVerification?: boolean
  }
  assignedTo?: string | { _id: string }
  status: string
}

function DeliveryBoyDashboard({ earning = 0 }: { earning?: number }) {
  const [assignments, setAssignments] = useState<IAssignment[]>([])
  const { userData } = useSelector((state: RootState) => state.user)
  const [activeOrder, setActiveOrder] = useState<IAssignment | null>(null)
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [userLocation, setUserLocation] = useState<ILocation>(
    {
      latitude: 0,
      longitude: 0
    }
  )
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0
  })

  const fetchAssignment = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/getassignments")
      if (result.data) {
        setAssignments(result.data)
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  const fetchCurrentOrder = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/current-order")
      if (result.data.active) {
        setActiveOrder(result.data.assignment)
        if (result.data.assignment?.order?.address?.latitude && result.data.assignment?.order?.address?.longitude) {
          setUserLocation({
            latitude: result.data.assignment.order.address.latitude,
            longitude: result.data.assignment.order.address.longitude,
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!userData?._id) return
    if (!navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setDeliveryBoyLocation({
          latitude: latitude,
          longitude: longitude
        })
        console.log("GeoUpdate success:", latitude, longitude)
        socket.emit("update-location", {
          userId: userData?._id,
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
  }, [userData?._id])

  useEffect(() => {
    const socket = getSocket()
    socket.on("new assignment", (deliveryAssignment: IAssignment) => {
      setAssignments((prev) => [...prev, deliveryAssignment])
    })
    return () => {
      socket.off("new assignment")
    }
  }, [])

  const handleAccept = async (id: string) => {
    try {
      await axios.post('/api/delivery/accept', { assignmentId: id })
      void fetchAssignment()
      void fetchCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const socket = getSocket()
    socket.on("update-deliveryBoy-location", ({ location }: { userId?: string; location: { coordinates: number[] } }) => {
      setDeliveryBoyLocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0]
      })
    })
    return () => {
      socket.off("update-deliveryBoy-location")
    }
  }, [])

  useEffect(() => {
    if (userData) {
      const loadData = async () => {
        await fetchAssignment()
        await fetchCurrentOrder()
      }
      void loadData()
    }
  }, [userData, fetchAssignment, fetchCurrentOrder])

  const sendOtp = async () => {
    if (!activeOrder) return
    setSendOtpLoading(true)
    try {
      const result = await axios.post("/api/delivery/otp/send", { orderId: activeOrder.order._id })
      console.log(result.data)
      setShowOtpBox(true)
      setSendOtpLoading(false)
    } catch {
      setSendOtpLoading(false)
      setOtpError("Failed to send OTP")
    }
  }
  const verifyOtp = async () => {
    if (!activeOrder) return
    setVerifyOtpLoading(true)
    try {
      const result = await axios.post("/api/delivery/otp/verify", { orderId: activeOrder.order._id, otp: otp })
      console.log(result.data)
      setActiveOrder(null)
      setVerifyOtpLoading(false)
      await fetchCurrentOrder()
      window.location.reload()
    } catch {
      setVerifyOtpLoading(false)
      setOtpError("Otp Verification Error")
    }
  }

  if(!activeOrder && assignments.length == 0 ){
    const todayEarnings =[
      {
        name:"Today",
        earning,
        deliveries:earning/40
      }
    ]
    return(
      <div className='flex items-center justify-center min-h-screen bg-linear-to-br
      from-white to-green-50 p-6'>
        <div className='max-w-md w-full text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>No Active Deliveries </h2>
          <p className='text-gray-500 mb-5'>Stay online to receive new orders</p>

          <div className='bg-white rounded-xl shadow-xl p-6'>
            <h2 className='font-medium text-green-700 mb-2'>Today&apos;s Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={todayEarnings}>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="earning" name="Earning (₹)"  />
                                    <Bar dataKey="deliveries" name="Deliveries"  />
            
                                </BarChart>
            
                            </ResponsiveContainer>

                    <p className="mt-4 text-lg font-bold text-green-700">₹{earning || 0} Earned today</p>
                    <button className="mt-4 w-full bg-green-600 hover:bg-green-700
                    text-white py-2 rounded-lg" onClick={()=>window.location.reload( )}>Refresh Earning</button>
          </div>

        </div>

      </div>
    )
  }

  if (activeOrder && userLocation) {
    return (
      <div className='pt-28 pb-10 px-4 min-h-screen bg-gray-50'>
        <div className='max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold text-green-700 mb-2'>Active Delivery</h1>
          <p className='text-gray-500 text-sm mb-4'>order#{activeOrder.order._id.slice(-6).toUpperCase()}</p>
          <div className='rounded-xl border shadow-lg overflow-hidden mb-6' >
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>
          <DeliveryChat
            orderId={activeOrder.order._id?.toString() }
            deliveryBoyId={userData?._id?.toString() || (activeOrder?.assignedTo && typeof activeOrder.assignedTo === 'object' ? activeOrder.assignedTo._id.toString() : activeOrder?.assignedTo?.toString()) || ""}
          />
          <div className='mt-6 bg-white rounded-xl border shadow p-6'>
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
              <button
                onClick={sendOtp}
                className='w-full py-4 bg-green-600 text-center text-white rounded-lg'>
                {sendOtpLoading ? <Loader size={16} className='animate-spin text-center text-white' /> : "Mark as Delivered"}
              </button>
            )}
            {showOtpBox && (
              <div className='mt-4 flex flex-col gap-3'>
                <input
                  type="text"
                  className='w-full py-3 border-2 border-gray-300 rounded-lg text-center text-lg tracking-widest font-semibold'
                  placeholder='Enter OTP'
                  maxLength={4}
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />
                <button
                  onClick={verifyOtp}
                  disabled={verifyOtpLoading}
                  style={{ backgroundColor: '#16a34a', color: '#ffffff', width: '100%', padding: '14px', borderRadius: '10px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {verifyOtpLoading ? <Loader size={18} className='animate-spin' /> : '✓  Verify OTP'}
                </button>
                {otpError && <div className='text-red-600 text-sm text-center'>{otpError}</div>}
              </div>
            )}
            {activeOrder.order.deliveryOtpVerification && <div className='text-green-600 
    text-center font-bold'>Delivery Completed</div>}


          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto pt-[100px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivery Boy Dashboard</h1>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No delivery assignments available
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white rounded-xl shadow p-4 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{assignment.order?._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {assignment.order?.address?.fullAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: <span className="capitalize">{assignment.status}</span>
                  </p>
                </div>

                {assignment.status === "broadcasted" && (
                  <button
                    onClick={() => handleAccept(assignment._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    Accept Assignment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
