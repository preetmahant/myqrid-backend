const { prisma } = require("../config/prisma");
const { logger } = require("../utils/logger");

function audit(action) {
  return async (req, res, next) => {
    res.on("finish", async () => {
      try {
        await prisma.auditLog.create({
          data: {
            actorUserId: req.user?.id || null,
            action,
            entityType: req.baseUrl.replace(/^\/api\//, "") || req.path,
            entityId: req.params.id || null,
            ipAddress: req.ip,
            userAgent: req.get("user-agent") || "",
            metadata: { method: req.method, path: req.originalUrl, statusCode: res.statusCode }
          }
        });
      } catch (error) {
        logger.warn("Audit log write failed", { message: error.message });
      }
    });

    return next();
  };
}

module.exports = { audit };
