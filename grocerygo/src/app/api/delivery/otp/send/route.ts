import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendOtpSchema } from "@/schemas/delivery.schema";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        // Rate limiting (IP-based)
        const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
        const { success } = await checkRateLimit(`otp:${ip}`, 3, "10 m");
        if (!success) {
            return NextResponse.json({ message: "Too many OTP requests. Please try again later." }, { status: 429 });
        }

        await connectDb()
        const body = await req.json()
        const parsed = sendOtpSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            )
        }
        const { orderId } = parsed.data
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return NextResponse.json(
                { message: "order not found" },
                { status: 404 }
            )
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        order.deliveryOtp = otp
        await order.save()

        // Try to send email but don't fail if email config is missing
        try {
            const userObj = order.user as { email?: string } | undefined
            const email = userObj?.email
            if (email && process.env.EMAIL && process.env.PASS) {
                const { sendMail } = await import("@/lib/mailer")
                await sendMail(
                    email,
                    "Your Delivery OTP",
                    `<h2>Your Delivery OTP is <strong>${otp}</strong></h2>`
                )
            }
        } catch (mailErr) {
            log.warn("Mail send failed (continuing)", mailErr)
        }

        return NextResponse.json(
            { message: "otp sent successfully", otp },
            { status: 200 }
        )

    } catch (error) {
        log.error("Send OTP error", error)
        return NextResponse.json(
            { message: `send otp error ${error}` },
            { status: 500 }
        )
    }
}
