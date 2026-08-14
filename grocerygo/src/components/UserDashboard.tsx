import React from 'react'

import connectDb from '@/lib/db'
import Grocery from '@/models/grocery.model'
import CategorySlider from './CategorySlider'
import GroceryItemCard, { GroceryItem } from './GroceryItemCard'

async function UserDashboard() {
  await connectDb()
  const groceries = await Grocery.find({})
  const plainGroceries = JSON.parse(JSON.stringify(groceries))

  return (
    <>
      <CategorySlider />
      <div className="w-[90%] md:w-[80%] mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Fresh Groceries
        </h2>
        {plainGroceries.length === 0 ? (
          <p className="text-center text-gray-500">No groceries available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {plainGroceries.map((item: GroceryItem, index: number) => (
              <GroceryItemCard key={item._id ?? index} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default UserDashboard
