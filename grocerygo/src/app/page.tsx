import { auth } from '@/auth'
import AdminDashboard from '@/components/AdminDashboard'
import DeliveryBoy from '@/components/DeliveryBoy'
import EditRoleMobile from '@/components/EditRoleMobile'
import GeoUpdate from '@/components/GeoUpdate'
import HeroSection from '@/components/HeroSection'
import Nav from '@/components/Nav'
import UserDashboard from '@/components/UserDashboard'
import Footer from '@/components/footer'
import connectDb from '@/lib/db'
import User from '@/models/user.model'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = "force-dynamic"

async function Home() {
  await connectDb()
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  const user = await User.findById(session.user.id)
  if (!user) {
    redirect("/login")
  }
  const inComplete = !user.mobile
  if(inComplete){
    return <EditRoleMobile/>
  }
  const plainUser = JSON.parse(JSON.stringify(user))

  return (   
    <>
      <Nav user={plainUser}/>
      <GeoUpdate userId={plainUser._id}/>
      {user.role === "user" ? (
        <>
          <HeroSection/>
          <UserDashboard/>
        </>
      ) : user.role === "admin" ? (
        <AdminDashboard/>
      ) : (
        <DeliveryBoy/>
      )}
      <Footer/>
    </>
  )
}

export default Home
