const { z } = require("./common.schemas");

const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().optional(),
    phone: z.string().min(8).max(20).optional(),
    password: z.string().min(8).optional(),
    tenantSlug: z.string().min(2).optional(),
    tenantName: z.string().min(2).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(8)
  }).refine(data => data.email || data.phone, "email or phone is required")
});

module.exports = { registerSchema, loginSchema };
