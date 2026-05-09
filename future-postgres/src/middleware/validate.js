function validate(schema) {

  return (
    req,
    res,
    next
  ) => {

    const result =
      schema.safeParse({

        body: req.body,

        query: req.query,

        params: req.params
      });

    if (!result.success) {

      return res
        .status(422)
        .json({

          success: false,

          error:
            "Validation failed",

          details:
            result.error.errors
        });
    }

    req.validated =
      result.data;

    return next();
  };
}

module.exports = {
  validate
};
