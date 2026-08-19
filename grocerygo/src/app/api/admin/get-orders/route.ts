import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const orders = await Order.find({}).populate("user assignedDeliveryBoy").sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json(
      { message: `get orders error: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
