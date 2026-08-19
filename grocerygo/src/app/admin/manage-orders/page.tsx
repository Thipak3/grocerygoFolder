'use client'
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AdminOrderCard from "@/components/AdminOrderCard"
import { getSocket } from "@/lib/socket"
import { IOrder } from "@/models/order.model"
import { IUser } from "@/models/user.model"

function MangaeOrders() {
    const [orders, setOrders] = useState<IOrder[]>([])
    const router = useRouter()

    useEffect(() => {
        const getOrders = async () => {
            try {
                const result = await axios.get("/api/admin/get-orders")
                setOrders(result.data)
            } catch (error) {
                console.error("Error fetching orders:", error)
            }
        }
        getOrders()
    }, [])

    useEffect(() => {
        const socket = getSocket()
        socket?.on("new-orders", (newOrder: IOrder) => {
            setOrders((prev) => [newOrder, ...prev])
        })
        socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }: { orderId: string; assignedDeliveryBoy: IUser }) => {
            setOrders((prev) => prev.map((o) => (
                o._id?.toString() === orderId ? { ...o, assignedDeliveryBoy: assignedDeliveryBoy._id } : o)))
        })
        return () => {
            socket.off("new-orders")
            socket.off("order-assigned")
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 w-full pt-16">
            <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
                <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
                    <button
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition cursor-pointer"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft size={24} className="text-green-700" />
                    </button>
                    <h1 className="text-lg font-medium text-gray-800">Manage Orders</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {orders && orders.map((order) => (
                    <AdminOrderCard
                        key={order._id?.toString()}
                        order={order}
                        onStatusUpdate={(orderId, newStatus) => {
                            setOrders(prev => prev.map(o => o._id?.toString() === orderId ? { ...o, status: newStatus as IOrder['status'] } : o))
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default MangaeOrders