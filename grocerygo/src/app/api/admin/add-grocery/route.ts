import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "you are not admin" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as File | null;

    // ✅ Validate required fields before hitting the DB
    if (!name?.trim() || !category?.trim() || !unit?.trim() || !price?.trim()) {
      return NextResponse.json(
        { message: "name, category, unit, and price are all required" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: "grocery image is required" },
        { status: 400 }
      );
    }

    const imageUrl = await uploadOnCloudinary(file);

    if (!imageUrl) {
      return NextResponse.json(
        { message: "image upload failed. Check your Cloudinary credentials in .env.local" },
        { status: 500 }
      );
    }

    const grocery = await Grocery.create({
      name: name.trim(),
      price,
      category: category.trim(),
      unit: unit.trim(),
      image: imageUrl,
    });

    return NextResponse.json(grocery, { status: 201 });

  } catch (error) {
    console.error("ADD GROCERY ERROR:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "failed to add grocery";
    return NextResponse.json({ message }, { status: 500 });
  }
}