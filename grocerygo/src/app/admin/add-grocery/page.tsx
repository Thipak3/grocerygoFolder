'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader, PlusCircle, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const CATEGORIES = [
  'Fruits & Vegetables',
  'Rice, Atta & Grains',
  'Snacks & Biscuits',
  'Dairy & Eggs',
  'Spices & Masalas',
  'Beverages & Drinks',
  'Personal Care',
  'Household Essentials',
  'Instant & Packaged Food',
  'Baby & Pet Care'
]

const UNITS = ['kg', 'g', 'liter', 'ml', 'piece', 'pack']

function AddGrocery() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('kg')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!name.trim() || !category || !price.trim() || !unit) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    if (!image) {
      setMessage({ type: 'error', text: 'Please select an image for the grocery item.' })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('price', price)
      formData.append('unit', unit)
      formData.append('image', image)

      await axios.post('/api/admin/add-grocery', formData)

      setMessage({ type: 'success', text: 'Grocery item added successfully!' })
      setName('')
      setCategory('')
      setPrice('')
      setUnit('kg')
      setImage(null)
      setPreview(null)
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to add grocery item'
        : 'Failed to add grocery item'
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-8 w-[95%] md:w-[80%] lg:w-[60%] mx-auto pb-20 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 mb-8"
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-4 py-2 rounded-full transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 flex items-center gap-2">
          <PlusCircle size={24} className="text-green-600" />
          Add New Grocery
        </h1>
      </motion.div>

      {/* Status Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-xl mb-6 font-medium text-sm border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Card */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6"
      >
        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Grocery Image <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition-colors bg-gray-50/50 group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-medium text-sm gap-2">
                  <Upload size={20} /> Change Image
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                  <ImageIcon size={28} />
                </div>
                <p className="font-semibold text-gray-700 text-sm mb-1">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Fresh Organic Bananas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-gray-800 text-sm"
            required
          />
        </div>

        {/* Category & Unit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-gray-800 text-sm bg-white cursor-pointer"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-gray-800 text-sm bg-white cursor-pointer"
              required
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-gray-800 text-sm"
              required
            />
          </div>
        </div>

        {/* Submit & Secondary Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Adding Grocery...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Add Grocery Item</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/view-grocery')}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition cursor-pointer"
          >
            View All Groceries
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default AddGrocery
