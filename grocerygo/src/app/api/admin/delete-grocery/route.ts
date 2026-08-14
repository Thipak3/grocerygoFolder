import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "you are not admin" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "grocery id is required" }, { status: 400 });
    }

    const deleted = await Grocery.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "grocery not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "grocery deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE GROCERY ERROR:", error);
    const message =
      error instanceof Error ? error.message : "failed to delete grocery";
    return NextResponse.json({ message }, { status: 500 });
  }
}
