const { z } = require("zod");

const idParam = z.object({ params: z.object({ id: z.coerce.bigint() }) });
const paginationQuery = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }).default({})
});

module.exports = { z, idParam, paginationQuery };
