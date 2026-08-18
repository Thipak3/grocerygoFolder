'use client'
import { ArrowLeft, EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail, User } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type propType = {
  previousStep: (s: number) => void
}

function RegisterForm({ previousStep }: propType) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signIn('google', { callbackUrl: '/', redirectTo: '/' })
    } catch (err) {
      console.error('Google sign in error:', err)
      setGoogleLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await axios.post('/api/auth/register', { name, email, password })
      router.push('/login')
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) || 'Registration failed'
        : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>
      <div
        className='absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer'
        onClick={() => previousStep(1)}
      >
        <ArrowLeft className='w-5 h-5' />
        <span className='font-medium'>Back</span>
      </div>
      <motion.h1 className='text-4xl font-extrabold text-green-700 mb-2'>Create Account</motion.h1>
      <p className='text-gray-600 mb-8 flex items-center'>
        Join GroceryGo today <Leaf className='w-5 h-5 text-green-600' />
      </p>
      <motion.form
        onSubmit={handleRegister}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='flex flex-col gap-5 w-full max-w-sm'
      >
        {error && (
          <p className='text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3'>{error}</p>
        )}
        <div className='relative'>
          <User className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder=' Your Name'
            className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>
        <div className='relative'>
          <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
          <input
            type='email'
            placeholder=' Your Email'
            className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className='relative'>
          <Lock className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder=' Your Password'
            className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <EyeOff className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(false)} />
          ) : (
            <EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(true)} />
          )}
        </div>
        {(() => {
          const formValidation = name !== '' && email !== '' && password !== ''
          return (
            <button
              type='submit'
              disabled={!formValidation || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                formValidation ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Register'}
            </button>
          )
        })()}
        <div className='flex items-center gap-2 text-gray-400 text-sm mt-2'>
          <span className='flex-1 h-px bg-gray-200'></span>
          OR
          <span className='flex-1 h-px bg-gray-200'></span>
        </div>
        <button
          type='button'
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className='w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {googleLoading ? (
            <Loader2 className='w-5 h-5 animate-spin text-green-600' />
          ) : (
            <img src='https://www.google.com/favicon.ico' width={20} height={20} alt='google' />
          )}
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>
      </motion.form>
      <p
        className='cursor-pointer text-gray-600 mt-6 text-sm flex items-center gap-1'
        onClick={() => router.push('/login')}
      >
        Already have an account ? <LogIn className='w-4 h-4' /> <span className='text-green-600'>Sign in </span>
      </p>
    </div>
  )
}

export default RegisterForm
