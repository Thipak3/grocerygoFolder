'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { getSocket } from '@/lib/socket'

import UserOrderCard from '@/components/UserOrderCard'
import Footer from '@/components/footer'

interface OrderItem {
  name: string
  price: number
  quantity: number
  unit: string
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  paymentMethod: string
  isPaid: boolean
  status: string
  createdAt: string
}

function MyOrder() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const result = await axios.get('/api/user/my-orders')
        setOrders(result.data)
      } catch {
        setError('Failed to load your orders.')
      } finally {
        setLoading(false)
      }
    }
    getMyOrders()
  }, [])

  useEffect(() => {
    const socket = getSocket()
    socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
      setOrders((prev) => prev?.map(o =>
        o._id === orderId ? { ...o, assignedDeliveryBoy } : o
      ))
    })
    return () => {
      socket.off('order-assigned')
    }

  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between pt-10">
      <div className="w-[92%] md:w-[80%] mx-auto mb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-8">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Package className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link href="/" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl">
              Shop Now
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <UserOrderCard key={order._id} order={order as any} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyOrder
