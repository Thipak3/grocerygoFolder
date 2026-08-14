'use client'
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AdminOrderCard from "@/components/AdminOrderCard"
import { getSocket } from "@/lib/socket"
import mongoose from "mongoose"
import { IUser } from "@/models/user.model"

interface IOrder {
    _id?: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
    items: {
        grocery: mongoose.Types.ObjectId;
        name: string;
        price: number;
        image: string;
        unit: string;
        quantity: number;
    }[];
    isPaid: boolean,

    totalAmount: number;
    paymentMethod: "cod" | "online";
    address: {
        fullName: string;
        mobile: string;
        city: string;
        state: string;
        pincode: string;
        fullAddress: string;
        latitude: number;
        longitude: number;
    }
    assingnment?: mongoose.Types.ObjectId
    assignedDeliveryBoy?: IUser
    status: "pending" | "out_for_delivery" | "delivered";
    createdAt?: Date;
    updatedAt?: Date;
}

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

    useEffect((): any => {
        const socket = getSocket()
        socket?.on("new-orders", (newOrder) => {
            setOrders((prev) => [newOrder, ...prev!])
        })
        socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
            setOrders((prev) => prev.map((o) => (
                o._id?.toString() === orderId ? { ...o, assignedDeliveryBoy } : o)))
        })
        return () => {
            socket.off("new-order")
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
                        order={order as any}
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