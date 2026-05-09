const { prisma } = require("../config/prisma");
const { ok } = require("../utils/apiResponse");

async function list(req, res) {
  const subscriptions = await prisma.subscription.findMany({ take: 100, orderBy: { createdAt: "desc" } });
  return ok(res, { subscriptions });
}

async function create(req, res) {
  const subscription = await prisma.subscription.create({ data: req.body });
  return ok(res, { subscription }, 201);
}

module.exports = { list, create };
