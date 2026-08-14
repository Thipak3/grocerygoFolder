import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await req.json();

    await connectDb();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { isOnline },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, isOnline: user.isOnline }, { status: 200 });
  } catch (error) {
    console.error("TOGGLE ONLINE ERROR:", error);
    return NextResponse.json(
      { message: `Error toggling online status: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
