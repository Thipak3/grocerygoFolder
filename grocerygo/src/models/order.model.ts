import mongoose from "mongoose";
import { IUser } from "./user.model";

export interface IOrder {
    _id?: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId | IUser;
    items: {
        grocery: mongoose.Types.ObjectId;
        name: string;
        price: number;
        image: string;
        unit: string;
        quantity: number;
    }[];
    isPaid: boolean,

    totalAmount: number;
    paymentMethod: "cod" | "online";
    address: {
        fullName: string;
        mobile: string;
        city: string;
        state: string;
        pincode: string;
        fullAddress: string;
        latitude: number;
        longitude: number;
    }
    assingnment?: mongoose.Types.ObjectId
    assignedDeliveryBoy?: mongoose.Types.ObjectId | IUser
    status: "pending" | "out_for_delivery" | "delivered";
    createdAt?: Date;
    updatedAt?: Date;
    deliveryOtp: string | null
    deliveryOtpVerification: boolean
    deliveredAt: Date
}

const orderSchema = new mongoose.Schema<IOrder>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            grocery: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Grocery",
                required: true
            },
            name: String,
            price: Number,
            image: String,
            unit: String,
            quantity: Number
        }
    ],
    isPaid: {
        type: Boolean,
        default: false
    },


    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        default: "cod"
    },
    totalAmount: Number,
    address: {
        fullName: String,
        mobile: String,
        city: String,
        state: String,
        pincode: String,
        fullAddress: String,
        latitude: Number,
        longitude: Number
    },
    assingnment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
        default: null

    },
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },


    status: {
        type: String,
        enum: ["pending", "out_for_delivery", "delivered"],
        default: "pending"
    },
    deliveryOtp: {
        type: String,
        default: null
    },
    deliveryOtpVerification: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export default Order;

