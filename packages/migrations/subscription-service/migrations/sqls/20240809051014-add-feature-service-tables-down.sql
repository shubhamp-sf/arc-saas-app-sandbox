-- Remove the inserted data from main.strategies
DELETE FROM main.strategies WHERE key IN ('System', 'Tenant', 'User', 'Plan');

-- Drop the tables in reverse order of creation
DROP TABLE IF EXISTS main.feature_values;
DROP TABLE IF EXISTS main.strategies;
DROP TABLE IF EXISTS main.features;