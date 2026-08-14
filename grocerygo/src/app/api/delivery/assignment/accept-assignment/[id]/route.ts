import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        await connectDb()
        const { id } = await params
        const session = await auth()
        const deliveryBoyId = session?.user?.id
        if (!deliveryBoyId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 400 })
        }
        const assignment = await DeliveryAssignment.findById(id)
        if (!assignment) {
            return NextResponse.json({ message: "Assignment not found" }, { status: 400 })
        }
        if (assignment.status !== "broadcasted") {
            return NextResponse.json({ message: "Assignment is already accepted" }, { status: 400 })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: { $nin: ["broadcasted", "completed"] }
        })
        if (alreadyAssigned) {
            return NextResponse.json({ message: "You already have an active delivery" }, { status: 400 })
        }
        assignment.assignedTo = deliveryBoyId
        assignment.status = "assigned"
        assignment.acceptedAt = Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 400 })
        }
        order.assignedDeliveryBoy = deliveryBoyId
        await order.save()

        await DeliveryAssignment.updateMany(
            {
                _id: { $ne: assignment._id },
                broadCastedTo: deliveryBoyId,
                status: "broadcasted"
            },
            { $pull: { broadCastedTo: deliveryBoyId } }
        )
        return NextResponse.json({ message: "Order accepted" }, { status: 200 })


    } catch (error) {
        return NextResponse.json({ message: `Something went wrong ${error}` }, { status: 500 })
    }
}