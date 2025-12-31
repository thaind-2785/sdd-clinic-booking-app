-- Check if pg_net extension is available
SELECT * FROM pg_available_extensions WHERE name = 'pg_net';

-- If available, enable it
-- CREATE EXTENSION IF NOT EXISTS pg_net;
