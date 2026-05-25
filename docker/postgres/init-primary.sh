#!/bin/bash
set -e

REPL_PASSWORD="${POSTGRES_REPL_PASSWORD:-repl_password}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'replicator') THEN
      CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '${REPL_PASSWORD}';
    END IF;
  END
  \$\$;

  SELECT pg_create_physical_replication_slot('replication_slot_1');
  SELECT pg_create_physical_replication_slot('replication_slot_2');
EOSQL

echo "host replication replicator 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "SELECT pg_reload_conf();"
