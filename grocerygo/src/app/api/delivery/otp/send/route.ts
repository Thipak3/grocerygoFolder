import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order.model";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { orderId } = await req.json()
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
            console.warn("Mail send failed (continuing):", mailErr)
        }

        return NextResponse.json(
            { message: "otp sent successfully", otp },
            { status: 200 }
        )

    } catch (error) {
        console.error("Send OTP error:", error)
        return NextResponse.json(
            { message: `send otp error ${error}` },
            { status: 500 }
        )
    }
}
