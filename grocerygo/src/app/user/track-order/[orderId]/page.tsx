'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from "next/navigation"
import mongoose from 'mongoose';
import { IUser } from '@/models/user.model';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ArrowLeft, Loader, Sparkle, Send } from 'lucide-react';
import dynamic from 'next/dynamic'
const LiveMap = dynamic(() => import('@/components/liveMap'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-100 rounded-xl border bg-gray-100 flex items-center justify-center text-gray-500 font-medium'>
      Loading Map...
    </div>
  )
})
import { getSocket } from '@/lib/socket';
import { motion, AnimatePresence } from 'motion/react';

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
    isPaid: boolean;
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
    };
    assingnment?: mongoose.Types.ObjectId;
    assignedDeliveryBoy?: IUser;
    status: "pending" | "out_for_delivery" | "delivered";
    createdAt?: Date;
    updatedAt?: Date;
}

interface ILocation {
    latitude: number;
    longitude: number;
}

interface ClientMessage {
    _id?: string;
    roomId: string;
    text: string;
    senderId: string;
    time: string;
}

export default function TrackOrder() {
    const { userData } = useSelector((state: RootState) => state.user)
    const params = useParams()
    const orderId = params?.orderId as string
    const [order, setOrder] = useState<IOrder>()
    const router = useRouter()
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState<ClientMessage[]>([])
    const chatBoxRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    const [userLocation, setUserLocation] = useState<ILocation>({
        latitude: 0,
        longitude: 0
    })
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
        latitude: 0,
        longitude: 0
    })

    useEffect(() => {
        if (!orderId) return
        const getOrder = async () => {
            try {
                const res = await axios.get(`/api/user/get-order/${orderId}`)
                const orderData = res.data.order || res.data
                setOrder(orderData)
                if (orderData?.address) {
                    setUserLocation({
                        latitude: orderData.address.latitude || 0,
                        longitude: orderData.address.longitude || 0
                    })
                }
                if (orderData?.assignedDeliveryBoy?.location?.coordinates) {
                    setDeliveryBoyLocation({
                        latitude: orderData.assignedDeliveryBoy.location.coordinates[1],
                        longitude: orderData.assignedDeliveryBoy.location.coordinates[0]
                    })
                }
            } catch (error) {
                console.log("Error getting order:", error)
            }
        }
        getOrder()
    }, [orderId, userData?._id])

    useEffect(() => {
        const socket = getSocket()
        socket.on("update-deliveryBoy-location", (data) => {
            if (data?.location) {
                setDeliveryBoyLocation({
                    latitude: data.location.coordinates?.[1] ?? data.location.latitude ?? 0,
                    longitude: data.location.coordinates?.[0] ?? data.location.longitude ?? 0,
                })
            }
        })
        return () => {
            socket.off("update-deliveryBoy-location")
        }
    }, [order])

    // Socket room join + incoming message listener
    useEffect(() => {
        if (!orderId) return
        const socket = getSocket()
        const roomIdStr = orderId.toString()

        const joinRoom = () => {
            console.log("[TrackOrder] Joining room:", roomIdStr, "socketId:", socket.id)
            socket.emit("join-room", roomIdStr)
        }

        if (socket.connected) {
            joinRoom()
        }
        socket.on("connect", joinRoom)

        const handleNewMessage = (message: ClientMessage) => {
            console.log("[TrackOrder] Received socket msg:", message, "expected roomId:", roomIdStr)
            if (message.roomId?.toString() === roomIdStr) {
                setMessages((prev) => {
                    const isDuplicate = prev.some(m =>
                        (m._id && message._id && m._id.toString() === message._id.toString()) ||
                        (m.text === message.text && m.senderId?.toString() === message.senderId?.toString() && m.time === message.time)
                    )
                    if (isDuplicate) return prev
                    return [...prev, message]
                })
            }
        }

        socket.on("send-message", handleNewMessage)

        return () => {
            socket.off("connect", joinRoom)
            socket.off("send-message", handleNewMessage)
        }
    }, [orderId])

    const sendMsg = () => {
        if (!newMessage.trim() || !orderId) return
        const socket = getSocket()
        const currentUserId = userData?._id?.toString() || (typeof order?.user === 'string' ? order.user : order?.user?.toString()) || ""
        if (!currentUserId) {
            console.warn("[TrackOrder] Cannot send: User ID not ready")
            return
        }
        const message: ClientMessage = {
            roomId: orderId.toString(),
            text: newMessage.trim(),
            senderId: currentUserId,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
        console.log("[TrackOrder] Sending message:", message, "socketConnected:", socket.connected)
        setMessages((prev) => [...prev, message])
        socket.emit("send-message", message)
        setNewMessage("")
    }

    useEffect(() => {
        if (!orderId) return
        const getAllMessages = async () => {
            try {
                const result = await axios.post("/api/chat/messages", { roomId: orderId })
                setMessages(result.data || [])
            } catch (error) {
                console.log("Error fetching messages:", error)
            }
        }
        getAllMessages()
    }, [orderId])

    useEffect(() => {
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current?.scrollHeight,
            behavior: "smooth"
        })
    }, [messages])

    const getSuggestion = async () => {
        setLoading(true)
        try {
            const currentUserId = userData?._id?.toString() || (typeof order?.user === 'string' ? order.user : order?.user?.toString()) || ""
            const lastMessage = messages?.filter(m => m.senderId?.toString() !== currentUserId)?.at(-1)
            const result = await axios.post("/api/chat/ai-suggestions", {
                message: lastMessage?.text || "Where is my order?",
                role: "user"
            })
            setSuggestions(result.data || [])
        } catch (error) {
            console.log("AI Suggest error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen bg-linear-to-b from-green-50 to-white'>
            <div className='max-w-2xl mx-auto pb-24'>
                <div className='sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-50'>
                    <button className='p-2 bg-green-100 rounded-full cursor-pointer' onClick={() => router.back()}>
                        <ArrowLeft className='text-green-700' size={20} />
                    </button>
                    <div>
                        <h2 className='text-xl font-bold'>Track Order</h2>
                        <p className='text-sm text-gray-600'>
                            Order #{order?._id?.toString().slice(-6).toUpperCase()}{' '}
                            <span className='text-green-700 font-semibold capitalize'>({order?.status?.replace(/_/g, ' ')})</span>
                        </p>
                    </div>
                </div>

                <div className='px-4 mt-6 space-y-4'>
                    <div className='rounded-3xl overflow-hidden border shadow'>
                        <LiveMap
                            userLocation={userLocation}
                            deliveryBoyLocation={deliveryBoyLocation}
                        />
                    </div>

                    <div className='bg-white rounded-3xl shadow-lg border p-4 h-107.5flex flex-col'>
                        <div className='flex justify-between items-center mb-3'>
                            <span className='font-semibold text-gray-700 text-sm'>Quick Replies</span>
                            <motion.button
                                disabled={loading}
                                whileTap={{ scale: 0.9 }}
                                className='px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer disabled:opacity-50'
                                onClick={getSuggestion}
                            >
                                <Sparkle size={14} />
                                {loading ? <Loader className='w-4 h-4 animate-spin' /> : "AI suggest"}
                            </motion.button>
                        </div>

                        <div className='flex gap-2 flex-wrap mb-3'>
                            {suggestions.map((s, i) => (
                                <motion.div
                                    key={`${s}-${i}`}
                                    whileTap={{ scale: 0.92 }}
                                    className='px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full cursor-pointer'
                                    onClick={() => setNewMessage(s)}
                                >
                                    {s}
                                </motion.div>
                            ))}
                        </div>

                        <div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
                            <AnimatePresence>
                                {messages.map((msg, index) => {
                                    const currentUserId = userData?._id?.toString() || (typeof order?.user === 'string' ? order.user : order?.user?.toString()) || ""
                                    const isMe = Boolean(currentUserId && msg.senderId?.toString() === currentUserId)
                                    return (
                                        <motion.div
                                            key={msg._id?.toString() || index}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[75%] p-3 rounded-2xl ${
                                                isMe
                                                    ? "bg-green-600 text-white rounded-br-none"
                                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <p className='text-[10px] opacity-70 mt-1 text-right'>{msg.time}</p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>

                        <div className='flex gap-2 mt-3 border-t pt-3'>
                            <input
                                type="text"
                                placeholder='Type a Message...'
                                className='flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all'
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                            />
                            <button
                                className='bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full transition-all cursor-pointer'
                                onClick={sendMsg}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
