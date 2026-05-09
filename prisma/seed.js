const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const roles = ["super_admin", "admin", "support", "vendor", "franchise", "enterprise", "user"];
const permissions = [
  "tags:create", "tags:update", "inventory:read", "inventory:write", "orders:read", "orders:create",
  "products:write", "subscriptions:read", "subscriptions:write", "devices:read", "devices:write", "admin:dashboard"
];
const profileModules = [
  "social_links", "gallery", "documents", "emergency", "payment", "reviews", "appointment", "insurance",
  "warranty", "live_tracking", "medical", "donations", "product_store", "qr_download", "analytics",
  "location_history", "maintenance_logs", "vaccination", "reward_banner", "finder_chat", "hidden_section", "private_notes"
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "myQRID", slug: "default" }
  });

  for (const roleName of roles) {
    await prisma.role.upsert({ where: { roleName }, update: {}, create: { roleName } });
  }

  for (const permissionName of permissions) {
    await prisma.permission.upsert({ where: { permissionName }, update: {}, create: { permissionName } });
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { roleName: "super_admin" } });
  const userRole = await prisma.role.findUniqueOrThrow({ where: { roleName: "user" } });
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permission.id }
    });
  }

  for (const moduleKey of profileModules) {
    await prisma.profileModule.upsert({
      where: { moduleKey },
      update: {},
      create: { moduleKey, title: moduleKey.replace(/_/g, " "), schema: {}, sortOrder: profileModules.indexOf(moduleKey) + 1 }
    });
  }

  for (const tagType of ["personal", "business", "asset", "pet", "safety", "medical", "helmet", "vehicle", "enterprise"]) {
    await prisma.tagTypeCustomization.upsert({
      where: { tagType },
      update: {},
      create: {
        tagType,
        allowedModules: profileModules,
        premiumModules: ["analytics", "location_history", "hidden_section", "live_tracking"],
        allowedFields: ["avatar", "bio", "phone", "email", "links"],
        hiddenFields: [],
        allowedThemes: ["classic", "premium", "glass"],
        colorPacks: ["purple", "blue", "green", "dark"],
        iconPacks: ["line", "solid"],
        animationSupport: true,
        dynamicModes: ["normal", "lost", "emergency", "business", "maintenance", "event"]
      }
    });
  }

  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      tenantId: tenant.id,
      username: "superadmin",
      email: "admin@myqrid.local",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      roleId: superAdminRole.id,
      isVerified: true
    }
  });

  await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      tenantId: tenant.id,
      username: "demo",
      email: "demo@myqrid.local",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      roleId: userRole.id,
      isVerified: true
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
