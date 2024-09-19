INSERT INTO main.roles(name, permissions, role_type, tenant_id)
    VALUES ('Marketplace', '{CreateTenant,ViewTenant,UpdateTenant,DeleteTenant,CreateTenantUser,CreateFeature,ViewFeature,UpdateFeature,ViewFeatureValues,UpdateFeatureValues,CreateFeatureValues,DeleteFeatureValues,10200,10201,10202,10203,10204,10216,10205,10206,10207,10208,10209,10210,10211,10212,10213,10214,10215,2,7008,8000,8001,8002,8003,7001,7002,7003,7004,7005,7006,7007,7008,7009,7010,7011,7012,7013,7014,7015,7016,7017,7018,7019,7020,7021,7022,7023,7024,7025,7026,7027,7028,7029,7030,7031,7032,7033,7034,7035}', 1,(
            SELECT
                id
            FROM
                main.tenants
            WHERE
                key = '{{TENANT_KEY}}'));

INSERT INTO main.users(first_name, last_name, username, email, auth_client_ids, default_tenant_id)
SELECT '{{MARKETPLACE_USER_NAME}}',
'',
'{{MARKETPLACE_USER_EMAIL}}', 
'{{MARKETPLACE_USER_EMAIL}}',
'{1}',
 id
FROM
    main.tenants
WHERE
    key = '{{TENANT_KEY}}';


INSERT INTO main.user_tenants(user_id, tenant_id, status, role_id)
SELECT
(
        SELECT
            id
        FROM
            main.users
        WHERE
            email = '{{MARKETPLACE_USER_EMAIL}}'),(
        SELECT
            id
        FROM
            main.tenants
        WHERE
            key = '{{TENANT_KEY}}'), 1, id
FROM
    main.roles
WHERE
    name = 'Marketplace';


INSERT INTO main.user_credentials(auth_id, auth_provider, user_id)
SELECT '{{USER_SUB}}', 'aws-cognito', id FROM main.users WHERE email = '{{MARKETPLACE_USER_EMAIL}}';