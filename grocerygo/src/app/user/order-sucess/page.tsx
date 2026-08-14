'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const sessionId = searchParams.get('session_id')
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        if (orderId && sessionId) {
            setVerifying(true)
            axios.get(`/api/user/verify-payment?orderId=${orderId}&session_id=${sessionId}`)
                .then(() => {
                    console.log('Payment verified successfully')
                })
                .catch((err) => {
                    console.error('Failed to verify payment:', err)
                })
                .finally(() => {
                    setVerifying(false)
                })
        }
    }, [orderId, sessionId])

    return (
        <div className='flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-linear-to-b from-green-50 to-white'>
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                }}
                className='relative'
            >
                <CheckCircle className='text-green-600 w-24 h-24 md:w-28 md:h-28' />
                <motion.div
                    className='absolute inset-0'
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0.3, 0, 0.3], scale: [1, 0.6, 1] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className='w-full h-full rounded-full bg-green-700 blur-2xl' />
                </motion.div>
            </motion.div>

            <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-4xl mt-6 font-bold text-green-700"
            >
                {verifying ? "Verifying Payment..." : "Order Placed Successfully"}
            </motion.h1>

            <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className='text-gray-600 mt-3 text-sm md:text-base max-w-md'
            >
                {verifying 
                    ? "Please wait while we confirm your payment details with Stripe."
                    : "Thank you for shopping with us! Your order has been placed and is being processed. You can track its progress in your My Orders section."
                }
            </motion.p>

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className='mt-10'
            >
                {verifying ? (
                    <Loader2 className='w-16 h-16 md:w-20 md:h-20 text-green-500 animate-spin' />
                ) : (
                    <Package className='w-16 h-16 md:w-20 md:h-20 text-green-500' />
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className='mt-12'
            >
                <Link href={"/user/my-orders"}>
                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.93 }}
                        className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-8 py-3 rounded-full shadow-lg transition-all cursor-pointer'
                    >
                        Go to My Orders Page <ArrowRight />
                    </motion.div>
                </Link>
            </motion.div>
        </div>
    )
}

function OrderSucess() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[80vh]">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    )
}

export default OrderSucess