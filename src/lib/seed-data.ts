import bcrypt from "bcryptjs";
import { ITenantConfig, IUser, ITransaction, IReward, INotification } from "./types";

export function seedInitialData() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);

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
    // Cashier 2: Ahmad
    {
      _id: "cashier_ahmad",
      role: "cashier",
      name: "Ahmad",
      username: "ahmad",
      staffPin: "1111",
      branchName: "Main Branch",
      isActive: true,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Member",
      createdAt: new Date().toISOString(),
    },
  ];

  const transactions: ITransaction[] = [];

  const rewards: IReward[] = [
    {
      _id: "rew_01",
      title: "Artisan Flat White or Latte",
      description: "Any handcrafted espresso milk beverage of your choice with specialty house beans.",
      pointsRequired: 80,
      category: "Drinks",
      imageUrl: "/coffee-latte.svg",
      isActive: true,
      stock: 999,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_02",
      title: "Kyoto Style Cold Brew (16oz)",
      description: "18-hour slow-drip single origin batch served over artisanal crystal ice.",
      pointsRequired: 120,
      category: "Drinks",
      imageUrl: "/cold-brew.svg",
      isActive: true,
      stock: 999,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_03",
      title: "Freshly Baked Pistachio Croissant",
      description: "Twice-baked French butter croissant filled with rich Iranian pistachio cream.",
      pointsRequired: 90,
      category: "Food",
      imageUrl: "/croissant.svg",
      isActive: true,
      stock: 45,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_04",
      title: "20% Off Entire Ticket",
      description: "Instant 20% discount on your entire beverage & food order during your visit.",
      pointsRequired: 200,
      category: "Special",
      imageUrl: "/discount.svg",
      isActive: true,
      stock: 999,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_05",
      title: "House Blend 250g Whole Bean Bag",
      description: "Signature Cove blend (Notes of dark chocolate, hazelnut, and sweet fig).",
      pointsRequired: 350,
      category: "Beans",
      imageUrl: "/coffee-bag.svg",
      isActive: true,
      stock: 30,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_06",
      title: "Cove Matte Ceramic Travel Tumbler",
      description: "Double-walled ceramic insulated tumbler with leak-proof walnut lid.",
      pointsRequired: 500,
      category: "Merchandise",
      imageUrl: "/tumbler.svg",
      isActive: true,
      stock: 12,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const notifications: INotification[] = [];

  return { config, users, transactions, rewards, notifications };
}
