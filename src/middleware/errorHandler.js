const { Prisma } = require("@prisma/client");
const { logger } = require("../utils/logger");
const { fail } = require("../utils/apiResponse");

function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  logger.error("Unhandled request error", {
    message: error.message,
    stack: error.stack,
    path: req.originalUrl
  });

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fail(res, "Database request failed", 400, { code: error.code });
  }

  if (error.name === "ZodError") {
    return fail(res, "Validation failed", 422, error.errors);
  }

  return fail(res, error.message || "Internal server error", error.statusCode || 500);
}

module.exports = { notFound, errorHandler };
