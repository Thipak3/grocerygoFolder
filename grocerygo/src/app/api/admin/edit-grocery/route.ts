import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "you are not admin" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as File | null;

    if (!id) {
      return NextResponse.json({ message: "grocery id is required" }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (category?.trim()) updateData.category = category.trim();
    if (unit?.trim()) updateData.unit = unit.trim();
    if (price?.trim()) updateData.price = price.trim();

    if (file && file.size > 0) {
      const imageUrl = await uploadOnCloudinary(file);
      if (imageUrl) {
        updateData.image = imageUrl;
      }
    }

    const updated = await Grocery.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ message: "grocery not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("EDIT GROCERY ERROR:", error);
    const message =
      error instanceof Error ? error.message : "failed to edit grocery";
    return NextResponse.json({ message }, { status: 500 });
  }
}
