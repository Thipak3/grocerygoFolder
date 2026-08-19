import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDb();
    const { userId, location } = await req.json();

    if (!userId || !location) {
      return NextResponse.json(
        { message: "missing userId or location" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "location updated", user },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Update location error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { message: `update location error: ${message}` },
      { status: 500 }
    );
  }
}
