"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { updateQuantity, removeFromCart } from '@/redux/cartSlice'
import { motion, AnimatePresence } from 'motion/react'
import Footer from '@/components/footer'

function CartPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { cartData } = useSelector((state: RootState) => state.cart)

  const handleIncrement = (id: string, currentQty: number) => {
    dispatch(updateQuantity({ _id: id, quantity: currentQty + 1 }))
  }

  const handleDecrement = (id: string, currentQty: number) => {
    dispatch(updateQuantity({ _id: id, quantity: currentQty - 1 }))
  }

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id))
  }

  const subtotal = cartData.reduce((acc, item) => {
    return acc + parseFloat(item.price) * item.quantity
  }, 0)

  const deliveryFee = subtotal > 0 ? 40 : 0
  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-[95%] sm:w-[85%] lg:w-[75%] mx-auto mb-24 relative">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Heading: h1 "My Shopping Cart" */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-extrabold text-gray-900 mb-8"
        >
          Your Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <ShoppingBag size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                  <p className="text-gray-500 mb-8 max-w-sm">Looks like you have not added anything to your cart yet. Go ahead and explore our fresh grocery products!</p>
                  <Link href="/" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200">
                    Start Shopping
                  </Link>
                </motion.div>
              ) : (
                cartData.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between"
                  >
                    {/* Item Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">{item.category}</span>
                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                        <p className="text-gray-500 text-sm">₹{item.price} / {item.unit}</p>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-6 justify-between w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-green-50 border border-green-100 rounded-full p-1.5 gap-3">
                        <button
                          onClick={() => item._id && handleDecrement(item._id, item.quantity)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-green-100 transition-colors shadow-sm text-green-700"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-base font-bold text-gray-800 min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => item._id && handleIncrement(item._id, item.quantity)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-green-100 transition-colors shadow-sm text-green-700"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price Display */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-lg font-extrabold text-green-800">
                          ₹{parseFloat(item.price) * item.quantity}
                        </span>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => item._id && handleRemove(item._id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Cart Summary Card */}
          {cartData.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-gray-800">₹{deliveryFee}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-gray-800">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-extrabold text-green-700">₹{total}</span>
                  </div>
                </div>

                <Link
                  href="/user/checkout"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CartPage
