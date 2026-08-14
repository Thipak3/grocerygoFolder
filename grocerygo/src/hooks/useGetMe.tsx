'use client'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'

function useGetMe() {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    const getMe = async () => {
      try {
        const result = await axios.get("/api/me")
        dispatch(setUserData(result.data))

      } catch (error) {

        console.log(error)
      }
    }
    getMe()
  }, [dispatch])
}

export default useGetMe