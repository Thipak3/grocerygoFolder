import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";
import User from "@/models/user.model";

export async function GET() {
  try {



    await connectDb();
    const session = await auth();
    const orders = await Order.find({ user: session?.user.id }).populate("user assignedDeliveryBoy")
      .sort({ createdAt: -1 })
    if (!orders) {
      return NextResponse.json({ message: "No orders found" }, { status: 404 })
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
