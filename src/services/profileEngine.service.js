const { prisma } = require("../config/prisma");

async function getProfileConfiguration(tagType, mode, premiumEnabled) {
  const customization = await prisma.tagTypeCustomization.findUnique({ where: { tagType } });
  const modules = await prisma.profileModule.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const allowed = new Set(customization?.allowedModules || []);
  const premium = new Set(customization?.premiumModules || []);

  return modules.filter(module => allowed.has(module.moduleKey) && (premiumEnabled || !premium.has(module.moduleKey))).map(module => ({
    key: module.moduleKey,
    title: module.title,
    schema: module.schema,
    mode
  }));
}

module.exports = { getProfileConfiguration };
