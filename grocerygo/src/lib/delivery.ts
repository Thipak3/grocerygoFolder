import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

export async function createDeliveryAssignment(orderId: string) {
  try {
    await connectDb();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found for delivery assignment creation: ${orderId}`);
      return null;
    }

    // Check if assignment already exists for this order
    const existingAssignment = await DeliveryAssignment.findOne({ order: orderId });
    if (existingAssignment) {
      return existingAssignment;
    }

    // Find online delivery boys
    let deliveryBoys = await User.find({
      role: "deliveryBoy",
      isOnline: true
    });

    // Fallback: If no delivery boys are online, broadcast to all delivery boys in the database so that it is testable
    if (deliveryBoys.length === 0) {
      deliveryBoys = await User.find({ role: "deliveryBoy" });
    }

    if (deliveryBoys.length === 0) {
      console.warn(`No delivery boys found in the system to broadcast order: ${orderId}`);
      return null;
    }

    // Create the delivery assignment
    const assignment = await DeliveryAssignment.create({
      order: orderId,
      broadcastedTo: deliveryBoys.map(db => db._id),
      status: "broadcasted",
      acceptedAt: null
    });

    // Update the order with the assignment reference
    order.assingnment = assignment._id;
    await order.save();

    console.log(`Successfully created delivery assignment ${assignment._id} for order ${orderId} broadcasted to ${deliveryBoys.length} delivery partners.`);
    return assignment;
  } catch (error) {
    console.error(`Error in createDeliveryAssignment for order ${orderId}:`, error);
    return null;
  }
}
