import bcrypt from "bcryptjs";
import { ITenantConfig, IUser, ITransaction, IReward, INotification } from "./types";

export function seedInitialData() {
  const adminPasswordHash = bcrypt.hashSync("CoveCoffee#2026", 10);

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
  ];

  const transactions: ITransaction[] = [];

  const rewards: IReward[] = [
    {
      _id: "rew_01",
      title: "فلات وايت أو لاتيه مختص",
      description: "أي مشروب إسبريسو بالحليب من اختيارك باستخدام حبوب القهوة المختصة.",
      pointsRequired: 50,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 999,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_02",
      title: "كولد برو مثلج منعش (16oz)",
      description: "مستخلص بالتقطير البطيء لمدة 18 ساعة ومقدم فوق مكعبات ثلج نقية.",
      pointsRequired: 80,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 999,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_03",
      title: "كرواسون فرنسي طازج بالفستق",
      description: "كرواسون زبدة فرنسي مخبوز طازجاً محشو بكريمة الفستق الإيراني الفاخرة.",
      pointsRequired: 70,
      category: "Food",
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 45,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_04",
      title: "دونوت الشوكولاتة البلجيكية",
      description: "دونوت مخبوز طري ومغطى بطبقة غنية من الشوكولاتة البلجيكية الفاخرة.",
      pointsRequired: 60,
      category: "Food",
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 50,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_05",
      title: "كيس حبوب قهوة مختصة 250 جرام",
      description: "خلطة كوف الخاصة بأسلوب التحميص المتوسط بنكهات الشوكولاتة والبندق والتين.",
      pointsRequired: 150,
      category: "Beans",
      imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 30,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "rew_06",
      title: "كوب سيراميك حافظ للحرارة أنيق",
      description: "كوب حراري مزدوج الجدران بحجم مثالي للقهوة والمشروبات الساخنة والباردة.",
      pointsRequired: 250,
      category: "Merchandise",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      isActive: true,
      stock: 12,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const notifications: INotification[] = [];

  return { config, users, transactions, rewards, notifications };
}
