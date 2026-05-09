const { prisma } = require(
  "../config/prisma"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function list(req, res) {

  const devices =
    await prisma.deviceMapping.findMany({

      where: {
        deletedAt: null
      },

      take: 100,

      orderBy: {
        createdAt: "desc"
      }
    });

  return ok(res, {
    devices
  });
}

async function create(req, res) {

  const device =
    await prisma.deviceMapping.create({
      data: req.body
    });

  return ok(
    res,
    { device },
    201
  );
}

module.exports = {
  list,
  create
};
