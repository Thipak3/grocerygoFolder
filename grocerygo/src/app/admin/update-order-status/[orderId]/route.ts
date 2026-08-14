import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler"

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await connectDb()
    const { orderId } = await params
    const { status } = await req.json()
    const order = await Order.findById(orderId).populate("user")
    if (!order) {
      return NextResponse.json(
        { message: "order not found" },
        { status: 400 }
      )

    }
    order.status = status
    let deliveryBoysPayload: any = []
    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 10000 } },

      })
      const nearByIds = nearByDeliveryBoys.map((b) => b._id)
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] }
      }).distinct("assignedTo")
      const busyIdSet = new Set(busyIds.map(b => String(b)))
      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        b => !busyIdSet.has(String(b._id))
      )
      const candidateIds = availableDeliveryBoys.map(b => b._id)

      if (candidateIds.length == 0) {
        await order.save()

        await emitEventHandler("order-status-update", { orderId: order._id, status: order.status })
        return NextResponse.json(
          { message: "there is no available Delivery boys" },
          { status: 400 }
        )
      }
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: candidateIds,

        status: "broadcasted"
      })
      await deliveryAssignment.populate("order");
      for (const boyId of candidateIds) {
        const boy = await User.findById(boyId)
        if (boy.socketId) {
          await emitEventHandler("new assignment", deliveryAssignment, boy.socketId)
        }

      }
      order.assignment = deliveryAssignment._id
      deliveryBoysPayload = availableDeliveryBoys.map(b => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0]


      }))

      await deliveryAssignment.populate("order")
      await order.save()
      await order.populate("user")
      await emitEventHandler("order-status-update", { orderId: order._id, status: order.status })
      return NextResponse.json({
        assignment: order.assignment?._id,
        availableBoys: deliveryBoysPayload
      }, { status: 200 })

    }

  } catch (error) {
    return NextResponse.json({
      message: `update status error ${error}`
    }, { status: 500 })

  }

}