import bcrypt from "bcryptjs";
import { ITenantConfig, IUser, ITransaction, IReward, INotification } from "./types";

export function seedInitialData() {
  const adminPasswordHash = bcrypt.hashSync("cove2026@", 10);

  const config: ITenantConfig = {
    _id: "config_cove_default",
    storeName: "Cove Coffee House",
    tagline: "Artisan Roastery & Specialty Brew Bar",
    logoUrl: "/logo.png",
    primaryColor: "#3F1215",
    accentColor: "#3F1215",
    terracottaColor: "#A44A3F",
    currency: "JOD",
    pointsPerUnit: 10,
    discountPer100Pts: 1.0,
    welcomeBonusPts: 50,
    updatedAt: new Date().toISOString(),
  };

  const users: IUser[] = [
    // Super Admin
    {
      _id: "admin_01",
      role: "super_admin",
      name: "Cove General Manager",
      username: "cove",
      email: "admin@covecoffee.com",
      passwordHash: adminPasswordHash,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Gold",
      createdAt: new Date().toISOString(),
    },
    // Cashier 1: Sajji
    {
      _id: "cashier_sajji",
      role: "cashier",
      name: "Sajji",
      username: "sajji",
      staffPin: "2026",
      branchName: "Main Branch",
      isActive: true,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Member",
      createdAt: new Date().toISOString(),
    },
  ];

  const transactions: ITransaction[] = [];

  const rewards: IReward[] = [];

  const notifications: INotification[] = [];

  return { config, users, transactions, rewards, notifications };
}
