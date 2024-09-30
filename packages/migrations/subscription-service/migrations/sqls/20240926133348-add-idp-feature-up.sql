/* Replace with your SQL commands */\
--- metadata has possible values for the feature - can be used to populate dropdowns
INSERT INTO main.features (id, name, key, description, default_value, type, metadata, created_by)
VALUES 
    (DEFAULT, 'Identity Provider', 'IdP', 'Identity Provider through which the tenant and its user will login to the application', 'Auth0', 'string', 'auth0,cognito,keyclock', '{{ADMIN_USER_TENANT_ID}}');
	
  