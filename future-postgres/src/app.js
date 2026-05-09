const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const apiRoutes = require("./routes");

const {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
  compressionMiddleware
} = require("./middleware/security");

const {
  notFound,
  errorHandler
} = require("./middleware/errorHandler");

const swaggerDocument = YAML.load(
  path.join(
    __dirname,
    "..",
    "..",
    "docs",
    "openapi.yaml"
  )
);

const app = express();

app.set(
  "json replacer",
  (key, value) => {
    return typeof value === "bigint"
      ? value.toString()
      : value;
  }
);

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(compressionMiddleware);

app.use(
  morgan("combined")
);

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

app.use(
  express.static(
    path.join(
      __dirname,
      "..",
      "..",
      "public"
    )
  )
);

app.get("/health", (req, res) => {

  res.json({
    success: true,
    service: "myQRID API",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use(
  "/api/v1",
  apiRoutes
);

app.use(notFound);

app.use(errorHandler);

module.exports = { app };
