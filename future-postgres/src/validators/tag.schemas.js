const { z } = require(
  "./common.schemas"
);

const tagType =
  z.enum([
    "personal",
    "business",
    "asset",
    "pet",
    "safety",
    "medical",
    "helmet",
    "luggage",
    "kid",
    "vehicle",
    "event",
    "creator",
    "employee",
    "enterprise"
  ]);

const createTagSchema =
  z.object({

    body:
      z.object({

        tenantId:
          z.coerce.bigint(),

        ownerUserId:
          z.coerce.bigint()
            .optional(),

        tagType,

        tagSubtype:
          z.string()
            .max(50)
            .optional()
      })
  });

const manufactureSchema =
  z.object({

    body:
      z.object({

        tenantId:
          z.coerce.bigint(),

        count:
          z.number()
            .int()
            .min(1)
            .max(1000),

        batchNumber:
          z.string()
            .min(2),

        vendorId:
          z.coerce.bigint()
            .optional(),

        warehouseLocation:
          z.string()
            .max(100)
            .optional()
      })
  });

module.exports = {
  createTagSchema,
  manufactureSchema
};
