'use client'
import React from 'react'
import {
  Apple, Milk, Wheat, Cookie, Flame, Coffee, Heart, Home, Box, Baby
} from "lucide-react"
import { motion } from "motion/react"

function CategorySlider() {
  const categories =[
    { id: 1, name: "Fruits & Vegetables", icon: Apple, color: "bg-green-100" },
    { id: 2, name: "Dairy & eggs", icon: Milk, color: "bg-yellow-100" },
    { id: 3, name: "Rice ,Atta & Grains", icon: Wheat, color: "bg-orange-100" },
    { id: 4, name: "Snacks & Biscuits", icon: Cookie, color: "bg-pink-100" },
    { id: 5, name: "Spices & Masalas", icon: Flame, color: "bg-red-100" },
    { id: 6, name: "Beverages & Drinks", icon: Coffee, color: "bg-blue-100" },
    { id: 7, name: "Personal Care", icon: Heart, color: "bg-purple-100" },
    { id: 8, name: "Household Essentials", icon: Home, color: "bg-lime-100" },
    { id: 9, name: "Instant & Packaged Food", icon: Box, color: "bg-teal-100" },
    { id: 10, name: "Baby & Pet Care", icon: Baby, color: "bg-rose-100" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[90%] md:w-[80%] mx-auto mt-10 mb-16"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat, index) => {
          const Icon = cat.icon
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl ${cat.color} border border-white shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <div className="p-3 rounded-full bg-white shadow-sm text-green-600">
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
                {cat.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default CategorySlider
