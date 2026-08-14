import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "you are not admin" }, { status: 401 });
    }

    const groceries = await Grocery.find().sort({ createdAt: -1 });
    return NextResponse.json(groceries, { status: 200 });
  } catch (error) {
    console.error("GET GROCERY ERROR:", error);
    const message =
      error instanceof Error ? error.message : "failed to fetch groceries";
    return NextResponse.json({ message }, { status: 500 });
  }
}
