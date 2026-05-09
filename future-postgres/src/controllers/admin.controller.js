const { prisma } = require(
  "../config/prisma"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function dashboard(req, res) {

  const [
    users,
    tags,
    orders,
    scans
  ] = await Promise.all([

    prisma.user.count({
      where: {
        deletedAt: null
      }
    }),

    prisma.tag.count({
      where: {
        deletedAt: null
      }
    }),

    prisma.order.count({
      where: {
        deletedAt: null
      }
    }),

    prisma.scanLog.count()
  ]);

  return ok(res, {
    metrics: {
      users,
      tags,
      orders,
      scans
    }
  });
}

module.exports = {
  dashboard
};
