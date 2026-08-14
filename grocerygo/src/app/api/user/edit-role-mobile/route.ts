import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES = ["user", "deliveryBoy", "admin"] as const;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, mobile } = await req.json();

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Choose admin, user or delivery boy." },
        { status: 400 }
      );
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { message: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    await connectDb();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, mobile: user.mobile, image: user.image } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
