import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    // Auto-create delivery assignment for any pending orders missing an assignment
    const unassignedOrders = await Order.find({
      assignment: { $in: [null, undefined] },
      status: { $in: ["pending", "out_for_delivery"] }
    });
    for (const ord of unassignedOrders) {
      const { createDeliveryAssignment } = await import("@/lib/delivery");
      await createDeliveryAssignment(ord._id.toString());
    }

    const assignments = await DeliveryAssignment.find({
      $or: [
        { status: "broadcasted" },
        { assignedTo: session.user.id, status: { $in: ["assigned", "completed"] } }
      ]
    })
      .populate({
        path: "order",
        populate: { path: "user", select: "name mobile" }
      })
      .sort({ createdAt: -1 })
      .lean();

    const plainAssignments = JSON.parse(JSON.stringify(assignments));

    return NextResponse.json(plainAssignments, { status: 200 });
  } catch (error) {
    console.error("GET ASSIGNMENTS ERROR:", error);
    return NextResponse.json(
      { message: `Error fetching assignments: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}