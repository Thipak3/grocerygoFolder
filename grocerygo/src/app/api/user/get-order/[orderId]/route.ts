import Order from "@/models/order.model"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params
        const order = await Order.findById(orderId).populate("assignedDeliveryBoy")
        if (!order) {
            return NextResponse.json(
                { message: "order not found" },
                { status: 404 })
        }
        return NextResponse.json({ order }, { status: 200 })



    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ message: "error while fetching order" }, { status: 500 })
    }
}

