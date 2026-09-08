import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { registerSchema } from "@/schemas/auth.schema";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    // Rate limiting (IP-based)
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const { success, remaining } = await checkRateLimit(`register:${ip}`, 5, "15 m");
    if (!success) {
      return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ message: `Register error: ${message}` }, { status: 500 });
  }
}
