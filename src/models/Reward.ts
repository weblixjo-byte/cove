import mongoose, { Schema, Document } from "mongoose";
import { IReward } from "@/lib/types";

export interface RewardDocument extends Omit<IReward, "_id">, Document {}

const RewardSchema = new Schema<RewardDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Drinks", "Food", "Beans", "Merchandise", "Special"],
      default: "Drinks",
    },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 999 },
    redemptionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Reward ||
  mongoose.model<RewardDocument>("Reward", RewardSchema);
