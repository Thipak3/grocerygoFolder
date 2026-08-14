import React from 'react'
import { auth } from '@/auth'
import DeliveryBoyDashboard from './DeliveryBoyDashboard'

async function DeliveryBoy() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="w-[95%] md:w-[85%] mx-auto mt-28 mb-16">
      <DeliveryBoyDashboard />
    </div>
  )
}

export default DeliveryBoy
