const { prisma } = require("../config/prisma");
const { cleanSlug, serialCode } = require("../utils/slug");

async function createTag({ tenantId, ownerUserId, tagType, tagSubtype }) {
  return prisma.$transaction(async tx => {
    const count = await tx.tag.count({ where: { tenantId } });
    const uniqueSlug = `${cleanSlug(tagType)}-${String(count + 1).padStart(6, "0")}`;
    const qrCodeUrl = `/t/${uniqueSlug}`;

    return tx.tag.create({
      data: {
        tenantId,
        ownerUserId,
        tagType,
        tagSubtype,
        uniqueSlug,
        qrCodeUrl,
        shortUrl: qrCodeUrl,
        status: ownerUserId ? "active" : "inactive",
        activationDate: ownerUserId ? new Date() : null
      }
    });
  });
}

async function createManufacturedInventory({ tenantId, count, batchNumber, vendorId, warehouseLocation }) {
  return prisma.$transaction(async tx => {
    const existing = await tx.tagInventory.count({ where: { tenantId } });
    const rows = [];

    for (let index = 1; index <= count; index += 1) {
      const serialNumber = serialCode("MQTAG", existing + index);
      rows.push({
        tenantId,
        batchNumber,
        vendorId,
        warehouseLocation,
        serialNumber,
        qrCode: `/activate/${serialNumber}`
      });
    }

    await tx.tagInventory.createMany({ data: rows, skipDuplicates: true });
    return rows;
  });
}

module.exports = { createTag, createManufacturedInventory };
