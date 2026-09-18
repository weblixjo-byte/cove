import mongoose, { Schema, Document } from "mongoose";
import { ITenantConfig } from "@/lib/types";

export interface TenantConfigDocument extends Omit<ITenantConfig, "_id">, Document {}

const TenantConfigSchema = new Schema<TenantConfigDocument>(
  {
    storeName: { type: String, required: true, default: "Cove Coffee House" },
    tagline: { type: String, default: "Artisan Roastery & Specialty Brew Bar" },
    logoUrl: { type: String, default: "/logo.png" },
    primaryColor: { type: String, default: "#3F1215" },
    accentColor: { type: String, default: "#3F1215" },
    terracottaColor: { type: String, default: "#A44A3F" },
    currency: { type: String, default: "JOD" },
    pointsPerUnit: { type: Number, default: 10 },
    discountPer100Pts: { type: Number, default: 1.00 },
    welcomeBonusPts: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export default mongoose.models.TenantConfig ||
  mongoose.model<TenantConfigDocument>("TenantConfig", TenantConfigSchema);
