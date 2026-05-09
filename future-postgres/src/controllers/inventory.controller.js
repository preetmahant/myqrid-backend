const { prisma } = require(
  "../config/prisma"
);

const tagService = require(
  "../services/tag.service"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function list(req, res) {

  const inventory =
    await prisma.tagInventory.findMany({

      where: {
        deletedAt: null
      },

      take: 100,

      orderBy: {
        createdAt: "desc"
      }
    });

  return ok(res, {
    inventory
  });
}

async function manufacture(req, res) {

  const rows =
    await tagService.createManufacturedInventory(
      req.validated.body
    );

  return ok(
    res,
    {
      inventory: rows
    },
    201
  );
}

module.exports = {
  list,
  manufacture
};
