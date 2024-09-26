UPDATE main.roles
SET permissions = array_cat(permissions, ARRAY['5321', '5322', '5323', '5324', '5325', '5326', '5327', '5328', '5329', '5331', '5332', '5333']::text[])
WHERE name = 'SuperAdmin';
