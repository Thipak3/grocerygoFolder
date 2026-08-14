'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { ArrowLeft, Home, Phone, User, MapPin, CreditCard, Truck } from 'lucide-react'
import { RootState } from '@/redux/store'
import { clearCart } from '@/redux/cartSlice'
import dynamic from 'next/dynamic'
import axios from 'axios'


const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
})

function CheckoutPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { userData } = useSelector((state: RootState) => state.user)
    const { cartData } = useSelector((state: RootState) => state.cart)

    const [address, setAdress] = useState({
        fullName: "",
        mobile: "",
        city: "",
        state: "",
        pinCode: "",
        fullAddress: ""
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [position, setPosition] = useState<[number, number] | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                setPosition([latitude, longitude])
            }, (err) => {
                console.log('location error', err)
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        }
    }, [])

    const subtotal = cartData.reduce((acc, item) => {
        return acc + (Number(item.price) || 0) * item.quantity
    }, 0)

    const deliveryFee = subtotal > 0 ? 40 : 0
    const total = subtotal + deliveryFee

    const handleCod = async () => {
        setError(null)

        // Use state value OR fallback to userData (for pre-filled fields)
        const effectiveFullName = address.fullName || userData?.name || ""
        const effectiveMobile = address.mobile || userData?.mobile || ""

        if (!position) {
            setError("Please select your location on the map.")
            return
        }
        if (!effectiveFullName || !effectiveMobile || !address.fullAddress || !address.city || !address.state || !address.pinCode) {
            setError("Please fill out all address fields.")
            return
        }
        if (!userData?._id) {
            setError("Please wait while your profile loads, then try again.")
            return
        }

        try {
            await axios.post("/api/user/order", {
                userId: userData?._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    unit: item.unit,
                    quantity: item.quantity,
                })),
                totalAmount: total,
                paymentMethod,
                address: {
                    fullName: effectiveFullName,
                    mobile: effectiveMobile,
                    city: address.city,
                    state: address.state,
                    pincode: address.pinCode,
                    fullAddress: address.fullAddress,
                    latitude: position[0],
                    longitude: position[1],
                }
            }, { withCredentials: true })

            dispatch(clearCart())
            router.push("/user/order-sucess")
        } catch (err) {
            console.error("Order placement failed:", err)
            setError("Failed to place order. Please try again.")
        }
    }

    const handleOnlinePayment = async () => {
        setError(null)

        // Use state value OR fallback to userData (for pre-filled fields)
        const effectiveFullName = address.fullName || userData?.name || ""
        const effectiveMobile = address.mobile || userData?.mobile || ""

        if (!position) {
            setError("Please select your location on the map.")
            return
        }
        if (!effectiveFullName || !effectiveMobile || !address.fullAddress || !address.city || !address.state || !address.pinCode) {
            setError("Please fill out all address fields.")
            return
        }
        if (!userData?._id) {
            setError("Please wait while your profile loads, then try again.")
            return
        }
        try {
            const result = await axios.post("/api/user/payment", {
                userId: userData?._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    unit: item.unit,
                    quantity: item.quantity,
                })),
                totalAmount: total,
                paymentMethod,
                address: {
                    fullName: effectiveFullName,
                    mobile: effectiveMobile,
                    city: address.city,
                    state: address.state,
                    pincode: address.pinCode,
                    fullAddress: address.fullAddress,
                    latitude: position[0],
                    longitude: position[1],
                }
            }, { withCredentials: true })

            dispatch(clearCart())
            if (result.data.url) {
                window.location.href = result.data.url
            } else {
                setError("Failed to get payment URL.")
            }
        } catch (err) {
            console.error("Online payment failed:", err)
            setError("Failed to initiate payment. Please try again.")
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 py-10'>
            <div className='w-[92%] md:w-[80%] mx-auto relative'>

                {/* Back Button */}
                <motion.button
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.3 }}
                    className='absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold'
                    onClick={() => router.push("/user/cart")}
                >
                    <ArrowLeft size={16} />
                    <span>Back to cart</span>
                </motion.button>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='text-3xl font-semibold text-green-700 text-center mb-10'
                >
                    Checkout
                </motion.h1>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

                    {/* Column 1: Delivery Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100'
                    >
                        <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4'>
                            <MapPin className='text-green-700' size={24} />
                            Delivery Address
                        </h2>

                        <div className='space-y-4'>
                            {/* Full Name */}
                            <div className='relative'>
                                <User className='absolute left-3 top-3 text-green-600' size={18} />
                                <input
                                    type="text"
                                    value={address.fullName || userData?.name || ""}
                                    placeholder="Full Name"
                                    onChange={(e) => setAdress(prev => ({ ...prev, fullName: e.target.value }))}
                                    className='pl-10 w-full border border-gray-200 focus:border-green-500 rounded-lg p-3 text-sm bg-gray-50 outline-none'
                                />
                            </div>

                            {/* Mobile */}
                            <div className='relative'>
                                <Phone className='absolute left-3 top-3 text-green-600' size={18} />
                                <input
                                    type="text"
                                    value={address.mobile || userData?.mobile || ""}
                                    placeholder="Mobile Number"
                                    onChange={(e) => setAdress(prev => ({ ...prev, mobile: e.target.value }))}
                                    className='pl-10 w-full border border-gray-200 focus:border-green-500 rounded-lg p-3 text-sm bg-gray-50 outline-none'
                                />
                            </div>

                            {/* Full Address */}
                            <div className='relative'>
                                <Home className='absolute left-3 top-3 text-green-600' size={18} />
                                <input
                                    type="text"
                                    value={address.fullAddress}
                                    placeholder='Full Address'
                                    onChange={(e) => setAdress(prev => ({ ...prev, fullAddress: e.target.value }))}
                                    className='pl-10 w-full border border-gray-200 focus:border-green-500 rounded-lg p-3 text-sm bg-gray-50 outline-none'
                                />
                            </div>

                            {/* City, State, Pin Code */}
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        value={address.city}
                                        placeholder='City'
                                        onChange={(e) => setAdress(prev => ({ ...prev, city: e.target.value }))}
                                        className='w-full border border-gray-200 focus:border-green-500 rounded-lg p-2.5 text-xs bg-gray-50 outline-none'
                                    />
                                </div>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        value={address.state}
                                        placeholder='State'
                                        onChange={(e) => setAdress(prev => ({ ...prev, state: e.target.value }))}
                                        className='w-full border border-gray-200 focus:border-green-500 rounded-lg p-2.5 text-xs bg-gray-50 outline-none'
                                    />
                                </div>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        value={address.pinCode}
                                        placeholder='Pin'
                                        onChange={(e) => setAdress(prev => ({ ...prev, pinCode: e.target.value }))}
                                        className='w-full border border-gray-200 focus:border-green-500 rounded-lg p-2.5 text-xs bg-gray-50 outline-none'
                                    />
                                </div>
                            </div>

                            {/* Map view wrapper */}
                            <div className='relative mt-6 h-[250px] rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50'>
                                {position && (
                                    <MapView
                                        position={position}
                                        setPosition={setPosition}
                                        setAdress={setAdress}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />
                                )}
                            </div>

                        </div>
                    </motion.div>

                    {/* Column 2: Payment Method & Place Order */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 flex flex-col gap-6 h-fit'
                    >
                        <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4'>
                            <CreditCard className='text-green-700' size={24} />
                            Payment Method
                        </h2>

                        <div className="space-y-4">
                            {/* Pay Online (stripe) */}
                            <div
                                onClick={() => setPaymentMethod('online')}
                                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'online'
                                        ? 'border-green-500 bg-green-50/30 text-green-700'
                                        : 'border-gray-200 hover:bg-gray-50/50 text-gray-700'
                                    }`}
                            >
                                <CreditCard size={20} className={paymentMethod === 'online' ? 'text-green-600' : 'text-gray-500'} />
                                <span className="font-semibold text-sm">Pay Online (Stripe)</span>
                            </div>

                            {/* Cash on Delivery */}
                            <div
                                onClick={() => setPaymentMethod('cod')}
                                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'cod'
                                        ? 'border-green-500 bg-green-50/30 text-green-700'
                                        : 'border-gray-200 hover:bg-gray-50/50 text-gray-700'
                                    }`}
                            >
                                <Truck size={20} className={paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-500'} />
                                <span className="font-semibold text-sm">Cash on Delivery</span>
                            </div>
                        </div>

                        {/* Order Summary & Place Order */}
                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-green-600">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-green-600">₹{deliveryFee}</span>
                            </div>
                            <hr className="border-gray-100" />
                            <div className="flex justify-between text-base font-bold text-gray-800">
                                <span>Final Total</span>
                                <span className="font-extrabold text-green-600">₹{total}</span>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-semibold text-center mt-2">
                                    {error}
                                </p>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={paymentMethod === 'online' ? handleOnlinePayment : handleCod}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {paymentMethod === 'online' ? 'Pay with Stripe' : 'Place Order'}
                            </motion.button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}

export default CheckoutPage