INSERT INTO main.plan_sizes (id, size, config, created_by)
VALUES 
    (DEFAULT, 'SMALL', '{"POSTGRES_SIZE": "10", "INSTANCE_CATEGORY": "t"}', '{{ADMIN_USER_TENANT_ID}}'),
    (DEFAULT, 'LARGE', '{"POSTGRES_SIZE": "50", "INSTANCE_CATEGORY": "c"}', '{{ADMIN_USER_TENANT_ID}}'),
    (DEFAULT, 'MEDIUM', '{"POSTGRES_SIZE": "25", "INSTANCE_CATEGORY": "m"}', '{{ADMIN_USER_TENANT_ID}}');

INSERT INTO main.features (id, name, key, description, default_value, type, metadata, created_by)
VALUES 
    (DEFAULT, 'Commission Rate', 'COMMISSION', '% Commission that goes to the SaaS Provider, for each call paid call that gets scheduled via the tenant''s application.', '0.5', 'number', '{}', '{{ADMIN_USER_TENANT_ID}}'),
    (DEFAULT, 'Monthly Consultation Limit', 'MONTHLY_CONSULTATION', 'Number of consultation that can be scheduled in a month across customers.', NULL, 'number', '{}', '{{ADMIN_USER_TENANT_ID}}'),
    (DEFAULT, 'Video Call', 'VIDEO_CALL', 'Whether to allow video call facility in the application.', 'false', 'boolean', '{}', '{{ADMIN_USER_TENANT_ID}}'),
    (DEFAULT, 'Online Medicine Store', 'MEDICINE_STORE', 'Feature to publish a medicine store page in the app.', 'false', 'boolean', '{}', '{{ADMIN_USER_TENANT_ID}}');
