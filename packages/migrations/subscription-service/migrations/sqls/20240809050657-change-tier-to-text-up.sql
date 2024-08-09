ALTER TABLE main.plans
    ALTER COLUMN tier TYPE text;

UPDATE main.plans SET
tier = 'PREMIUM'::text WHERE
tier = '1';

UPDATE main.plans SET
tier = 'STANDARD'::text WHERE
tier = '0';