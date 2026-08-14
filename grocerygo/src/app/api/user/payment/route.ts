import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const { userId, items, totalAmount, paymentMethod, address } = await req.json();

    if (!items || !userId || totalAmount == null || !address) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount: Number(totalAmount),
      paymentMethod,
      address,
      isPaid: false,
    });

    const baseUrl = process.env.NEXT_BASE_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${baseUrl}/user/order-sucess?orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/user/checkout`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "GroceryGo Order",
              description: `Order #${newOrder._id} — ${items.length} item(s)`,
            },
            unit_amount: Math.round(Number(totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return NextResponse.json({ message: "Payment error" }, { status: 500 });
  }
}
