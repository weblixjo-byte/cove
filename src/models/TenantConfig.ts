import mongoose, { Schema, Document } from "mongoose";
import { ITenantConfig } from "@/lib/types";

export interface TenantConfigDocument extends Omit<ITenantConfig, "_id">, Document {}

const TenantConfigSchema = new Schema<TenantConfigDocument>(
  {
    storeName: { type: String, required: true, default: "Cove Coffee House" },
    tagline: { type: String, default: "Artisan Roastery & Specialty Brew Bar" },
    logoUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#2C221E" },
    accentColor: { type: String, default: "#1A5336" },
    terracottaColor: { type: String, default: "#C87D55" },
    currency: { type: String, default: "KWD" },
    pointsPerUnit: { type: Number, default: 10 },
    discountPer100Pts: { type: Number, default: 1.00 },
    welcomeBonusPts: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export default mongoose.models.TenantConfig ||
  mongoose.model<TenantConfigDocument>("TenantConfig", TenantConfigSchema);
