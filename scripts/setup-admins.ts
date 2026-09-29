import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not found in environment variables");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Super Admin
  const superAdminEmail = "superadmin@example.com";
  const superAdminPassword = "superadmin123";
  const superAdminName = "Super Admin";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: superAdminName,
        passwordHash: superAdminPasswordHash,
        role: "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });

    console.log("Super admin created successfully!");
    console.log("Email:", superAdminEmail);
    console.log("Password:", superAdminPassword);
    console.log("Role:", superAdmin.role);
  } else {
    console.log("Super admin already exists:", superAdminEmail);
    console.log("User role:", existingSuperAdmin.role);
  }

  // Create Regular Admin
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";
  const adminName = "Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    console.log("\nAdmin created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
  } else {
    console.log("\nAdmin already exists:", adminEmail);
    console.log("User role:", existingAdmin.role);
  }

  console.log("\n⚠️  Please change the passwords after first login!");
}

main()
  .catch((e) => {
    console.error("Error creating super admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
