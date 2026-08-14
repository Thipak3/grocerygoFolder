import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId, status } = await req.json();

    if (!assignmentId || !status) {
      return NextResponse.json({ message: "assignmentId and status are required" }, { status: 400 });
    }

    const validStatuses = ["assigned", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    await connectDb();

    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      assignedTo: session.user.id
    });

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found or not assigned to you" }, { status: 404 });
    }

    assignment.status = status;
    await assignment.save();

    // If completed, also update order status
    if (status === "completed") {
      await Order.findByIdAndUpdate(assignment.order, { status: "delivered" });
    }

    return NextResponse.json({ message: "Status updated", assignment }, { status: 200 });
  } catch (error) {
    console.error("UPDATE DELIVERY STATUS ERROR:", error);
    return NextResponse.json(
      { message: `Error updating status: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
