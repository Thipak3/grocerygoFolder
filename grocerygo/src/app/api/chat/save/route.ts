import connectDb from "@/lib/db";
import Message from "@/models/message.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { roomId, senderId, text, time } = await req.json()

        if (!roomId || !senderId || !text) {
            return NextResponse.json(
                { message: "roomId, senderId, and text are required" },
                { status: 400 }
            )
        }

        if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(senderId)) {
            return NextResponse.json(
                { message: "Invalid roomId or senderId format" },
                { status: 400 }
            )
        }

        const message = await Message.create({
            roomId,
            senderId,
            text,
            time
        })
        return NextResponse.json(
            message, { status: 200 }
        )

    } catch (error) {
        console.error("Save message error:", error)
        return NextResponse.json(
            { message: `save message error ${error}` },
            { status: 500 }
        )
    }
}
