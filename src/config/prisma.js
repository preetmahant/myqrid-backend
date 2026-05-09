const { PrismaClient } = require("@prisma/client");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" }
  ]
});

prisma.$on("error", event => logger.error("Prisma error", event));
prisma.$on("warn", event => logger.warn("Prisma warning", event));

module.exports = { prisma };
