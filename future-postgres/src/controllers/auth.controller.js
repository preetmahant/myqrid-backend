const authService = require(
  "../services/auth.service"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function register(req, res) {

  const user =
    await authService.register(
      req.validated.body
    );

  return ok(
    res,
    { user },
    201
  );
}

async function login(req, res) {

  const result =
    await authService.login({
      ...req.validated.body,
      deviceName: req.get(
        "x-device-name"
      ),
      ipAddress: req.ip,
      userAgent: req.get(
        "user-agent"
      )
    });

  return ok(
    res,
    result
  );
}

async function me(req, res) {

  return ok(res, {
    user: req.user
  });
}

module.exports = {
  register,
  login,
  me
};
