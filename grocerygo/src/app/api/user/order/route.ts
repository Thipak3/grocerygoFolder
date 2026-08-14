import { auth } from "@/auth";
import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Please log in to place an order" },
        { status: 401 }
      );
    }

    const { userId, items, paymentMethod, totalAmount, address } = await req.json();

    if (!items || !userId || !paymentMethod || totalAmount == null || !address) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newOrder = await Order.create({
      user: user._id,
      items,
      paymentMethod,
      totalAmount: Number(totalAmount),
      address,
    });

    await emitEventHandler("new-order", newOrder)

    // Create delivery assignment immediately for Cash On Delivery orders
    if (paymentMethod === "cod") {
      const { createDeliveryAssignment } = await import("@/lib/delivery");
      await createDeliveryAssignment(newOrder._id.toString());
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Error while placing order" }, { status: 500 });
  }
}
