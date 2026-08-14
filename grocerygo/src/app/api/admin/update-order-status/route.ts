import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: "orderId and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "out_for_delivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
    }

    await connectDb();
    const updatePayload: { status: string; isPaid?: boolean } = { status };
    if (status === "delivered") {
      updatePayload.isPaid = true;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updatePayload,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return NextResponse.json(
      { message: `Update order status error: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
