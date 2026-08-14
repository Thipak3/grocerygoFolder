import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import Stripe from "stripe";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id");

    if (!orderId || !sessionId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await connectDb();

    // Verify order belongs to the logged-in user
    const order = await Order.findOne({ _id: orderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If already paid, return early
    if (order.isPaid) {
      return NextResponse.json({ success: true, isPaid: true }, { status: 200 });
    }

    // Retrieve checkout session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // If checkout session is paid, update the order
    if (stripeSession.payment_status === "paid") {
      order.isPaid = true;
      await order.save();
      
      // Create delivery assignment for paid online orders
      const { createDeliveryAssignment } = await import("@/lib/delivery");
      await createDeliveryAssignment(order._id!.toString());

      return NextResponse.json({ success: true, isPaid: true }, { status: 200 });
    }

    return NextResponse.json({ success: true, isPaid: false }, { status: 200 });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
