'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { addToCart, updateQuantity } from '@/redux/cartSlice'

export interface GroceryItem {
  _id?: string
  name: string
  category: string
  price: string
  unit: string
  image: string
}

function GroceryItemCard({ item }: { item: GroceryItem }) {
  const dispatch = useDispatch<AppDispatch>()
  const { cartData } = useSelector((state: RootState) => state.cart)
  const cartItem = cartData.find((cartItem) => cartItem._id === item._id)

  const handleIncrement = () => {
    if (item._id && cartItem) {
      dispatch(updateQuantity({ _id: item._id, quantity: cartItem.quantity + 1 }))
    }
  }

  const handleDecrement = () => {
    if (item._id && cartItem) {
      dispatch(updateQuantity({ _id: item._id, quantity: cartItem.quantity - 1 }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, amount: 0.5 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
    >
      <div className="relative w-full h-48 bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            fill
            alt={item.name}
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs text-green-600 font-medium">{item.category}</span>
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-green-700 font-bold mt-auto">
          ₹{item.price}{' '}
          <span className="text-sm font-normal text-gray-500">/ {item.unit}</span>
        </p>
      </div>
      {!cartItem ? (
        <motion.button
          className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200"
          onClick={() => {
            if (item._id) {
              dispatch(addToCart({ ...item, quantity: 1 }))
            }
          }}
          disabled={!item._id}
        >
          <ShoppingCart />Add to Cart
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 flex items-center justify-center bg-green-50 border border-green-200 rounded-full py-2 px-4 gap-4"
        >
          <button
            onClick={handleDecrement}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all"
          >
            <Minus size={16} className="text-green-700" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {cartItem.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all"
          >
            <Plus size={16} className="text-green-700" />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default GroceryItemCard
