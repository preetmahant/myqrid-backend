const { z } = require(
  "./common.schemas"
);

const createOrderSchema =
  z.object({

    body:
      z.object({

        tenantId:
          z.coerce.bigint(),

        userId:
          z.coerce.bigint(),

        paymentMethod:
          z.enum([
            "online",
            "cod",
            "wallet",
            "free"
          ])

          .default("online"),

        shippingAddress:
          z.record(
            z.any()
          ),

        items:
          z.array(

            z.object({

              productId:
                z.coerce.bigint()
                  .optional(),

              tagId:
                z.coerce.bigint()
                  .optional(),

              title:
                z.string()
                  .min(1),

              quantity:
                z.number()
                  .int()
                  .min(1),

              unitPrice:
                z.number()
                  .nonnegative(),

              gstAmount:
                z.number()
                  .nonnegative()
                  .default(0)
            })
          )

          .min(1)
      })
  });

module.exports = {
  createOrderSchema
};
