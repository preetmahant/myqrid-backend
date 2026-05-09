const { fail } = require(
  "../utils/apiResponse"
);

function requireRole(
  ...roles
) {

  return (
    req,
    res,
    next
  ) => {

    if (
      !req.user ||
      !roles.includes(
        req.user.role.roleName
      )
    ) {

      return fail(
        res,
        "Insufficient role",
        403
      );
    }

    return next();
  };
}

function requirePermission(
  permissionName
) {

  return (
    req,
    res,
    next
  ) => {

    const permissions =
      req.user?.role?.permissions || [];

    const allowed =
      permissions.some(
        item =>
          item.permission.permissionName ===
          permissionName
      );

    if (!allowed) {

      return fail(
        res,
        "Missing permission",
        403
      );
    }

    return next();
  };
}

module.exports = {
  requireRole,
  requirePermission
};
