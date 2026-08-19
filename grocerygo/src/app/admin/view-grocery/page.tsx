'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { ArrowLeft, Loader, Trash2, Pencil, Package, Search, X, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import mongoose from 'mongoose'
import { useRouter } from 'next/navigation'

interface IGrocery {
  _id: mongoose.Types.ObjectId
  name: string
  category: string
  price: string
  unit: string
  image: string | null
  createdAt?: Date
  updatedAt?: Date
}

function ViewGrocery() {
  const router = useRouter()
  const [groceries, setGroceries] = useState<IGrocery[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Search and edit states
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<IGrocery | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', unit: '' })
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const result = await axios.get("/admin/get-grocery")
        setGroceries(result.data)
      } catch (error) {
        console.error("Error fetching groceries:", error)
        setMessage({ type: "error", text: "Failed to load groceries" })
      } finally {
        setLoading(false)
      }
    }
    fetchGroceries()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grocery item?")) return
    setDeletingId(id)
    setMessage(null)
    try {
      await axios.delete(`/api/admin/delete-grocery?id=${id}`)
      setGroceries(prev => prev.filter(g => g._id.toString() !== id))
      setMessage({ type: "success", text: "Grocery deleted successfully!" })
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "Failed to delete grocery"
        : "Failed to delete grocery"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (grocery: IGrocery) => {
    setEditing(grocery)
    setEditForm({
      name: grocery.name,
      category: grocery.category,
      price: grocery.price,
      unit: grocery.unit,
    })
    setEditImage(null)
    setEditPreview(grocery.image || null)
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setEditImage(file)
    if (file) {
      setEditPreview(URL.createObjectURL(file))
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('id', editing._id.toString())
      formData.append('name', editForm.name)
      formData.append('category', editForm.category)
      formData.append('price', editForm.price)
      formData.append('unit', editForm.unit)
      if (editImage) formData.append('image', editImage)

      const result = await axios.put('/api/admin/edit-grocery', formData)
      setGroceries(prev => prev.map(g => g._id.toString() === editing._id.toString() ? result.data : g))
      setEditing(null)
      setMessage({ type: "success", text: "Grocery updated successfully!" })
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "Failed to update grocery"
        : "Failed to update grocery"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setEditLoading(false)
    }
  }

  const filtered = groceries.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='pt-4 w-[95%] md:w-[85%] mx-auto pb-20'>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className='flex flex-col sm:flex-row items-center justify-between gap-4
    mb-8 text-center sm:text-left'

      >
        <button
          onClick={() => router.push("/")}
          className='flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200
    text-green-700 font-semibold px-4 py-2 rounded-full transition w-full sm:w-auto'

        ><ArrowLeft size={18} /><span>Back</span></button>
        <h1 className='text-2xl md:text-3xl font-extrabold text-green-700 flex items-center
    justify-center gap-2'><Package size={18} className='text-green-600' />Manage Groceries</h1>

      </motion.div>
      <motion.form initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex items-center bg-white border border-gray-200 rounded-full px-5 py-3
    shadow-sm mb-10 hover:shadow-lg transition-all max-w-lg mx-auto w-full' >

        <Search className='text-gray-500 w-5 h-5 mr-2' />
        <input type="text" className='w-full outline-none text-gray-700 placeholder-gray-400'
          placeholder='Search by name or category...'
          value={search}
          onChange={(e) => setSearch(e.target.value)} />



      </motion.form>

      {/* Status message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center py-3 px-4 rounded-xl mb-6 font-medium text-sm ${message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <Loader className='w-8 h-8 text-green-600 animate-spin' />
          <p className='text-gray-500 mt-3 text-sm'>Loading groceries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <Package className='w-12 h-12 text-gray-300' />
          <p className='text-gray-400 mt-3 text-base'>No groceries found.</p>
        </div>
      ) : (
        /* Grocery cards list */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {filtered.map((grocery, index) => (
            <motion.div
              key={grocery._id.toString()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => openEdit(grocery)}
              className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-5 cursor-pointer ${index !== filtered.length - 1 ? 'border-b border-gray-100' : ''
                } hover:bg-green-50/30 transition-colors`}
            >
              {/* Product image */}
              <div className='w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center'>
                {grocery.image ? (
                  <Image
                    src={grocery.image}
                    alt={grocery.name}
                    width={100}
                    height={100}
                    className='w-full h-full object-contain p-1'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Package className='w-8 h-8 text-gray-300' />
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className='flex-1 min-w-0'>
                <h3 className='text-base sm:text-lg font-semibold text-gray-800 truncate'>
                  {grocery.name}
                </h3>
                <p className='text-sm text-gray-400 mt-0.5'>{grocery.category}</p>
                <p className='mt-2'>
                  <span className='text-green-700 font-bold text-base sm:text-lg'>₹{grocery.price}/</span>
                  <span className='text-gray-500 text-sm ml-1'>{grocery.unit}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className='flex items-center gap-2 flex-shrink-0'>
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(grocery) }}
                  className='flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                font-semibold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm'
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(grocery._id.toString()) }}
                  disabled={deletingId === grocery._id.toString()}
                  className='flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600
                font-semibold px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50'
                >
                  {deletingId === grocery._id.toString() ? (
                    <Loader size={14} className='animate-spin' />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 relative'
            >
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-gray-800'>Edit Grocery</h2>
                <button
                  onClick={() => setEditing(null)}
                  className='text-gray-400 hover:text-gray-600 transition'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Product Image */}
              <div className='w-full h-[200px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-5 flex items-center justify-center relative group cursor-pointer'>
                {editPreview ? (
                  <Image
                    src={editPreview}
                    alt={editing.name}
                    width={200}
                    height={200}
                    className='w-full h-full object-contain p-2'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Package className='w-12 h-12 text-gray-300' />
                  </div>
                )}

                {/* Full overlay on hover / click */}
                <label htmlFor='imageUpload' className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                flex flex-col items-center justify-center cursor-pointer transition-opacity text-white font-medium text-xs gap-1.5'>
                  <Upload size={26} className='text-green-400' />
                  <span>Click to change image</span>
                </label>

                <input
                  type='file'
                  accept='image/*'
                  hidden
                  id='imageUpload'
                  onChange={handleEditImageChange}
                />
              </div>

              <form onSubmit={handleEditSubmit} className='space-y-3'>
                {/* Name */}
                <input
                  type='text'
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className='w-full border-b border-gray-200 px-1 py-2.5 outline-none
                focus:border-green-500 transition text-gray-800 text-sm bg-transparent'
                  placeholder='Grocery name'
                  required
                />

                {/* Category Dropdown */}
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className='w-full border-b border-gray-200 px-1 py-2.5 outline-none
                focus:border-green-500 transition text-gray-800 text-sm bg-transparent
                appearance-none cursor-pointer'
                  required
                >
                  <option value=''>Select Category</option>
                  <option value='Fruits & Vegetables'>Fruits & Vegetables</option>
                  <option value='Rice ,Atta & Grains'>Rice, Atta & Grains</option>
                  <option value='Snacks & Biscuits'>Snacks & Biscuits</option>
                  <option value='Dairy & eggs'>Dairy & Eggs</option>
                  <option value='Spices & Masalas'>Spices & Masalas</option>
                  <option value='Beverages & Drinks'>Beverages & Drinks</option>
                  <option value='Personal Care'>Personal Care</option>
                  <option value='Household Essentials'>Household Essentials</option>
                  <option value='Instant & Packaged Food'>Instant & Packaged Food</option>
                  <option value='Baby & Pet Care'>Baby & Pet Care</option>
                </select>

                {/* Price */}
                <input
                  type='text'
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className='w-full border-b border-gray-200 px-1 py-2.5 outline-none
                focus:border-green-500 transition text-gray-800 text-sm bg-transparent'
                  placeholder='Price'
                  required
                />

                {/* Unit Dropdown */}
                <select
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className='w-full border-b border-gray-200 px-1 py-2.5 outline-none
                focus:border-green-500 transition text-gray-800 text-sm bg-transparent
                appearance-none cursor-pointer'
                  required
                >
                  <option value='kg'>kg</option>
                  <option value='g'>g</option>
                  <option value='liter'>liter</option>
                  <option value='ml'>ml</option>
                  <option value='piece'>piece</option>
                  <option value='pack'>pack</option>
                </select>

                {/* Action Buttons */}
                <div className='flex items-center justify-center gap-3 pt-3'>
                  <button
                    type='submit'
                    disabled={editLoading}
                    className='bg-green-600 hover:bg-green-700 text-white font-semibold
                  px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 
                  flex items-center justify-center gap-2 text-sm'
                  >
                    {editLoading ? (
                      <>
                        <Loader size={14} className='animate-spin' />
                        Saving...
                      </>
                    ) : (
                      'Edit Grocery'
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      handleDelete(editing._id.toString())
                      setEditing(null)
                    }}
                    className='bg-red-600 hover:bg-red-700 text-white font-semibold
                  px-5 py-2.5 rounded-lg transition-colors text-sm'
                  >
                    Delete Grocery
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ViewGrocery
