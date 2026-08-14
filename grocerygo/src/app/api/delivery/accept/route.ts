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

    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ message: "assignmentId is required" }, { status: 400 });
    }

    await connectDb();

    const assignment = await DeliveryAssignment.findById(assignmentId);

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "broadcasted") {
      return NextResponse.json({ message: "Assignment already taken" }, { status: 400 });
    }

    // Update assignment
    assignment.assignedTo = session.user.id;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // Update order with assigned delivery boy
    await Order.findByIdAndUpdate(assignment.order, {
      assignedDeliveryBoy: session.user.id,
      assingnment: assignment._id,
      status: "out_for_delivery"
    });

    return NextResponse.json({ message: "Delivery accepted successfully", assignment }, { status: 200 });
  } catch (error) {
    console.error("ACCEPT DELIVERY ERROR:", error);
    return NextResponse.json(
      { message: `Error accepting delivery: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
