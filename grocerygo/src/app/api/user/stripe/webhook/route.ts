import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeEventSchema } from "@/schemas/stripe.schema";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    log.error("Stripe signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const parsedEvent = stripeEventSchema.safeParse(event);
  if (!parsedEvent.success) {
    return NextResponse.json({ error: "Invalid event shape" }, { status: 400 });
  }

  if (parsedEvent.data.type === "checkout.session.completed") {
    const orderId = parsedEvent.data.data.object.metadata?.orderId;

    if (orderId) {
      await connectDb();
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Create delivery assignment for paid online orders
      const { createDeliveryAssignment } = await import("@/lib/delivery");
      await createDeliveryAssignment(orderId);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
