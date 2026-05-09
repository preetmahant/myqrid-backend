# Full PostgreSQL schema map

The executable schema is `prisma/schema.prisma`. It includes these production tables:

- tenants
- users
- roles
- permissions
- role_permissions
- user_sessions
- otp_codes
- tags
- tag_type_customizations
- profile_modules
- tag_inventory
- products
- orders
- order_items
- subscriptions
- premium_features
- device_mappings
- scan_logs
- lost_and_found
- emergency_alerts
- emergency_contacts
- vehicle_profiles
- pet_profiles
- asset_profiles
- business_profiles
- files
- notifications
- api_keys
- audit_logs
- activity_logs
- affiliate_partners
- enterprise_accounts

Soft delete support is provided by `deleted_at` on core mutable entities. Multi-tenant support is provided by `tenant_id` on platform-owned entities.
