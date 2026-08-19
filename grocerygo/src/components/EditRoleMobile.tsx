'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Bike, User, UserCog } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function EditRoleMobile() {
  const router = useRouter()
  const { update } = useSession()
  const [roles, setRoles] = useState([
    { id: 'admin', label: 'admin', icon: UserCog },
    { id: 'user', label: 'User', icon: User },
    { id: 'deliveryBoy', label: 'Delivery Boy', icon: Bike },
  ])
  const [selectedRole, setSelectedRole] = useState('')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const result = await axios.get('/api/check-for-admin');
        if (result.data.adminExist) {
          setRoles(prev => prev.filter(r => r.id !== "admin"))
        }
      } catch (error) {
        console.log(error)
      }
    }
    void checkForAdmin()
  }, [])

  const handleEdit = async () => {
    setError(null)
    setLoading(true)
    try {
      await axios.post('/api/user/edit-role-mobile', {
        role: selectedRole,
        mobile,
      })
      await update({ role: selectedRole, mobile })
      router.refresh()
      router.push('/')
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'Failed to update profile'
        : 'Failed to update profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center min-h-screen p-6 w-full'>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className='text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8'
      >
        Select Your Role
      </motion.h1>
      <div className='flex flex-row md:flex-row justify-center items-center gap-6 mt-10'>
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id
          return (
            <motion.div
              whileTap={{ scale: 0.94 }}
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                  ? 'border-green-600 bg-green-100 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-green-400'
                }`}
            >
              <Icon className={isSelected ? 'text-green-600 w-8 h-8' : 'text-gray-500 w-8 h-8'} />
              <span className={isSelected ? 'text-green-600 font-semibold mt-2' : 'text-gray-600 mt-2'}>
                {role.label}
              </span>
            </motion.div>
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className='flex flex-col items-center mt-10'
      >
        <label htmlFor='mobile' className='text-gray-700 font-medium mb-2'>
          Enter Your Mobile No.
        </label>
        <input
          type='tel'
          id='mobile'
          value={mobile}
          className='w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800'
          placeholder='eg. 9876543210'
          maxLength={10}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
        />
      </motion.div>
      {error && <p className='text-red-600 text-sm mt-4'>{error}</p>}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        disabled={mobile.length !== 10 || !selectedRole || loading}
        className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 w-50 mt-10 ${selectedRole && mobile.length === 10 && !loading
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        onClick={handleEdit}
      >
        {loading ? 'Saving...' : 'Go to Home'}
        <ArrowRight />
      </motion.button>
    </div>
  )
}

export default EditRoleMobile
