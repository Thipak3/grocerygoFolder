import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectDb()

    const { userId, socketId } = await req.json()
    const user = await User.findByIdAndUpdate(userId, {
      socketId: socketId,
      isOnline: true
    }, { new: true })
    if (!user) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false }, { status: 500 })

  }
}
