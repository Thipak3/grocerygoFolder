'use client'
import { EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import React, { useState, Suspense } from 'react'
import { motion } from "motion/react"
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { loginWithGoogle } from '@/actions/authActions'

function LoginFormContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false  
      })

      if (result?.ok) {
        router.push("/")
      } else {
        alert("Invalid email or password")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false) 
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await loginWithGoogle()
    } catch (err) {
      console.error("Google sign in error:", err)
      setGoogleLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>
      <motion.h1 className='text-4xl font-extrabold text-green-700 mb-2'>
        Welcome Back
      </motion.h1>
      <p className='text-gray-600 mb-8 flex items-center'>Login to GroceryGo <Leaf className='w-5 h-5 text-green-600'/></p>
      
      {errorParam && (
        <div className='w-full max-w-sm mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center font-medium'>
          {errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback' || errorParam === 'Configuration'
            ? 'Google sign-in failed. Please check your Google Client ID, Secret, and Redirect URI in Google Cloud Console.'
            : 'Authentication failed. Please try again.'}
        </div>
      )}

      <motion.form 
        suppressHydrationWarning
        onSubmit={handleLogin}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='flex flex-col gap-5 w-full max-w-sm'
      >
        <div className='relative'>
          <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'/>
          <input type="text" placeholder=' Your Email' className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none' onChange={(e)=>setEmail(e.target.value)} value={email}/>
        </div>
        <div className='relative'>
          <Lock className='absolute left-3 top-3.5 w-5 h-5 text-gray-400'/>
          <input type={showPassword?"text":"password"} placeholder=' Your Password' className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none' onChange={(e)=>setPassword(e.target.value)} value={password}/>
          {
            showPassword?<EyeOff className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={()=>setShowPassword(false)}/>:<EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={()=>setShowPassword(true)}/> 
          }
        </div>
        {
          (()=>{
            const formValidation= email!=="" && password!==""
            return <button disabled={!formValidation || loading || googleLoading} type="submit" className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
              formValidation
              ?"bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              :"bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
              {loading?<Loader2 className='w-5 h-5 animate-spin'/>:"Login"}
            </button>
          })()
        }
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
            <img src="https://www.google.com/favicon.ico" width={20} height={20} alt="google"/>
          )}
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>
      </motion.form>  
      
      <p className='cursor-pointer text-gray-600 mt-6 text-sm flex items-center gap-1' onClick={()=>router.push("/register")}>Want to create an account ? <LogIn className='w-4 h-4'/> <span className='text-green-600'>Sign Up </span>
      </p>
    </div> 
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>}>
      <LoginFormContent />
    </Suspense>
  )
}
