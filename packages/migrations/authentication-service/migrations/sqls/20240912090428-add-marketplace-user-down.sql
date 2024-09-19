-- Remove the user credentials
DELETE FROM main.user_credentials
WHERE user_id = (SELECT id FROM main.users WHERE email = '{{MARKETPLACE_USER_EMAIL}}');

-- Remove the user from the tenant
DELETE FROM main.user_tenants
WHERE user_id = (SELECT id FROM main.users WHERE email = '{{MARKETPLACE_USER_EMAIL}}')
  AND tenant_id = (SELECT id FROM main.tenants WHERE key = '{{TENANT_KEY}}');

-- Delete the user
DELETE FROM main.users
WHERE email = '{{MARKETPLACE_USER_EMAIL}}';

-- Delete the Marketplace role
DELETE FROM main.roles
WHERE name = 'Marketplace'
  AND tenant_id = (SELECT id FROM main.tenants WHERE key = '{{TENANT_KEY}}');