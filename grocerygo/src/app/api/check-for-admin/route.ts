import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    return NextResponse.json({ isAdmin: true });
  }
  return NextResponse.json({ isAdmin: false }, { status: 401 });
}
