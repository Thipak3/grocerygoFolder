
import connectDb from "@/lib/db";
import Message from "@/models/message.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { roomId } = await req.json();
        if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
            return NextResponse.json([], { status: 200 });
        }
        const messages = await Message.find({ roomId })

        return NextResponse.json(
            messages, { status: 200 }
        )

    } catch (error) {
        console.error("Get messages error:", error)
        return NextResponse.json(
            { message: `get messages error ${error}` },
            { status: 500 }
        )
    }
}