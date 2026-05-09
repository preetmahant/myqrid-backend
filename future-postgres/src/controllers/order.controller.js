const { prisma } = require(
  "../config/prisma"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function list(req, res) {

  const orders =
    await prisma.order.findMany({

      where: {
        deletedAt: null
      },

      include: {
        items: true
      },

      take: 50,

      orderBy: {
        createdAt: "desc"
      }
    });

  return ok(res, {
    orders
  });
}

async function create(req, res) {

  const data =
    req.validated.body;

  const totalAmount =
    data.items.reduce(
      (sum, item) => {

        return (
          sum +
          (
            item.quantity *
            item.unitPrice
          ) +
          item.gstAmount
        );
      },
      0
    );

  const gstAmount =
    data.items.reduce(
      (sum, item) => {

        return (
          sum + item.gstAmount
        );
      },
      0
    );

  const orderNumber =
    `MQORD-${Date.now()}`;

  const order =
    await prisma.order.create({

      data: {

        tenantId:
          data.tenantId,

        userId:
          data.userId,

        orderNumber,

        totalAmount,

        gstAmount,

        shippingCharge: 0,

        paymentMethod:
          data.paymentMethod,

        codStatus:
          data.paymentMethod === "cod"
            ? "pending"
            : "not_applicable",

        shippingAddress:
          data.shippingAddress,

        items: {
          create: data.items
        }
      },

      include: {
        items: true
      }
    });

  return ok(
    res,
    { order },
    201
  );
}

module.exports = {
  list,
  create
};
