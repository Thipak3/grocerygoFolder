import { getSocket } from '@/lib/socket'
import axios from 'axios'
import { Loader, Send, Sparkle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

interface ClientMessage {
    _id?: string
    roomId: string
    text: string
    senderId: string
    time: string
}

type props = {
    orderId: string
    deliveryBoyId: string
}

function DeliveryChat({ orderId, deliveryBoyId }: props) {
    const [newMessage, setNewMessage] = useState('')
    const [messages, setMessages] = useState<ClientMessage[]>([])
    const chatBoxRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    // Join socket room and listen for incoming messages
    useEffect(() => {
        if (!orderId) return
        const socket = getSocket()
        const roomIdStr = orderId.toString()

        const joinRoom = () => {
            socket.emit("join-room", roomIdStr)
            console.log("[DeliveryChat] joined room:", roomIdStr)
        }

        if (socket.connected) {
            joinRoom()
        }
        socket.on("connect", joinRoom)

        const handleNewMessage = (message: ClientMessage) => {
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

    // Send a message
    const sendMsg = () => {
        if (!newMessage.trim() || !orderId) return
        const socket = getSocket()
        const senderId = deliveryBoyId?.toString() || ""
        if (!senderId) return

        const message: ClientMessage = {
            roomId: orderId.toString(),
            text: newMessage.trim(),
            senderId,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        }
        // Optimistically add to UI
        setMessages((prev) => [...prev, message])
        socket.emit("send-message", message)
        setNewMessage("")
    }

    // Load chat history from DB
    useEffect(() => {
        if (!orderId) return
        const getAllMessages = async () => {
            try {
                const result = await axios.post("/api/chat/messages", { roomId: orderId })
                setMessages(result.data || [])
            } catch (error) {
                console.log("Chat fetch error:", error)
            }
        }
        getAllMessages()
    }, [orderId])

    // Auto-scroll to latest message
    useEffect(() => {
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current?.scrollHeight,
            behavior: "smooth"
        })
    }, [messages])

    const getSuggestion = async () => {
        setLoading(true)
        try {
            const lastMessage = messages.filter(m => m.senderId?.toString() !== deliveryBoyId?.toString()).at(-1)
            const result = await axios.post("/api/chat/ai-suggestions", {
                message: lastMessage?.text || "Order is out for delivery",
                role: "delivery-boy"
            })
            setSuggestions(result.data || [])
        } catch (error) {
            console.log("AI Suggestion error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='bg-white rounded-3xl shadow-lg border p-4 h-[430px] flex flex-col my-4'>
            {/* Header with AI suggest */}
            <div className='flex justify-between items-center mb-3'>
                <span className='font-semibold text-gray-700 text-sm'>Chat with Customer</span>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                    onClick={getSuggestion}
                    className='px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer disabled:opacity-50'
                >
                    <Sparkle size={14} />
                    {loading ? <Loader className='w-4 h-4 animate-spin' /> : "AI suggest"}
                </motion.button>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
                <div className='flex gap-2 flex-wrap mb-3'>
                    {suggestions.map((s, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.92 }}
                            className='px-3 py-1 text-xs bg-green-50 cursor-pointer border border-green-200 text-green-700 rounded-full'
                            onClick={() => setNewMessage(s)}
                        >
                            {s}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
                <AnimatePresence>
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId?.toString() === deliveryBoyId?.toString()
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

            {/* Input */}
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
    )
}

export default DeliveryChat