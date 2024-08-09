ALTER TABLE main.plans
    ALTER COLUMN tier TYPE smallint;


UPDATE main.plans SET
tier = 1 WHERE
tier = 'PREMIUM';

UPDATE main.plans SET
tier = 0 WHERE
tier = 'STANDARD';