const { app } = require(
  "./app"
);

const { env } = require(
  "./config/env"
);

const {
  connectRedis
} = require(
  "./config/redis"
);

const { prisma } = require(
  "./config/prisma"
);

const { logger } = require(
  "./utils/logger"
);

async function start() {

  await prisma.$connect();

  connectRedis().catch(
    error => {

      logger.warn(
        "Redis connection skipped",
        {
          message:
            error.message
        }
      );
    }
  );

  const server =
    app.listen(
      env.PORT,
      () => {

        logger.info(
          `myQRID API running on port ${env.PORT}`
        );
      }
    );

  async function shutdown(
    signal
  ) {

    logger.info(
      `Received ${signal}, shutting down`
    );

    server.close(
      async () => {

        await prisma.$disconnect();

        process.exit(0);
      }
    );
  }

  process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
  );

  process.on(
    "SIGINT",
    () => shutdown("SIGINT")
  );
}

start().catch(
  error => {

    logger.error(
      "Server startup failed",
      {
        message:
          error.message,

        stack:
          error.stack
      }
    );

    process.exit(1);
  }
);
