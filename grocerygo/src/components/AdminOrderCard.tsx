'use client'

import { IOrder } from '@/models/order.model'
import { CreditCard, MapPin, Package, Phone, User, ChevronDown, ChevronUp, Loader2, Truck, Clock, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import React, { useState } from 'react'
import axios from 'axios'
import Image from 'next/image'

interface AdminOrderCardProps {
    order: IOrder
    onStatusUpdate?: (orderId: string, newStatus: string) => void
}

function AdminOrderCard({ order, onStatusUpdate }: AdminOrderCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [status, setStatus] = useState(order.status)
    const [loading, setLoading] = useState(false)

    const statusOptions = ['pending', 'out_for_delivery', 'delivered']

    const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
        pending: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: <Clock size={14} />
        },
        out_for_delivery: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: <Truck size={14} />
        },
        delivered: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: <CheckCircle2 size={14} />
        }
    }

    const currentStatusConfig = statusConfig[status] || statusConfig.pending

    const updateStatus = async (orderId: string, newStatus: string) => {
        setLoading(true)
        try {
            await axios.post(`/api/admin/update-order-status`, { orderId, status: newStatus })
            setStatus(newStatus as IOrder['status'])
            onStatusUpdate?.(orderId, newStatus)
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            key={order._id?.toString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-5 transition-all"
        >
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                {/* Left: Order Info */}
                <div className='space-y-1 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-lg font-bold flex items-center gap-2 text-green-700'>
                            <Package size={20}/> 
                            Order #{order._id?.toString().slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            order.isPaid
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                        }`}>
                            {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                    </div>
                    
                    <p className='text-gray-400 text-xs'>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                    </p>

                    {/* Customer Details */}
                    <div className='mt-3 space-y-1 text-gray-700 text-sm'>
                        <p className='flex items-center gap-2 font-semibold text-gray-800'>
                            <User size={16} className="text-green-600"/>
                            <span>{order?.address?.fullName}</span>
                        </p>
                        <p className='flex items-center gap-2'>
                            <Phone size={16} className="text-green-600"/>
                            <a href={`tel:${order?.address?.mobile}`} className="hover:underline">{order?.address?.mobile}</a>
                        </p>
                        <p className='flex items-start gap-2'>
                            <MapPin size={16} className="text-green-600 shrink-0 mt-0.5"/>
                            <span className="text-xs text-gray-500">
                                {order?.address?.fullAddress}, {order?.address?.city}, {order?.address?.state} - {order?.address?.pincode}
                            </span>
                        </p>
                    </div>

                    <p className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
                        <CreditCard size={16} className="text-green-600"/>
                        <span>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
                    </p>
                </div>

                {/* Right: Total, Status, Actions */}
                <div className='flex flex-col items-start md:items-end gap-3'>
                    <div className="text-right">
                        <span className="text-xs text-gray-400 block font-medium">Total Amount</span>
                        <span className="text-xl font-black text-green-700">₹{order.totalAmount}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full text-center capitalize border flex items-center justify-center gap-1.5 ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}>
                            {currentStatusConfig.icon}
                            {status.replace(/_/g, ' ')}
                        </span>
                        
                        {/* Status Dropdown */}
                        <div className="relative flex items-center">
                            <select 
                                value={status}
                                disabled={loading}
                                onChange={(e) => updateStatus(order._id!.toString(), e.target.value)}
                                className='w-full md:w-auto border border-gray-200 bg-white rounded-xl pl-3 pr-8 py-1.5 text-sm shadow-sm hover:border-green-400 transition focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer disabled:opacity-50'
                            >
                                {statusOptions.map(st => (
                                    <option key={st} value={st}>
                                        {st.replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 pointer-events-none text-gray-400">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>

                    {/* Expand Toggle */}
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors mt-2 cursor-pointer"
                    >
                        {expanded ? (
                            <>Hide Items <ChevronUp size={16} /></>
                        ) : (
                            <>View Items ({order.items?.length}) <ChevronDown size={16} /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Expandable Items List */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
                            <div className="grid gap-3">
                                {order.items?.map((item, index) => (
                                    <motion.div 
                                        key={index} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                                {item.image ? (
                                                    <Image src={item.image} fill alt={item.name} className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-400">₹{item.price} / {item.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 block">Qty: {item.quantity}</span>
                                            <span className="font-semibold text-sm text-gray-800">₹{item.price * item.quantity}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Order Summary Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                                <span className="text-xs text-gray-400">{order.items?.length} item{(order.items?.length || 0) > 1 ? 's' : ''}</span>
                                <span className="text-sm font-bold text-green-700">Total: ₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default AdminOrderCard