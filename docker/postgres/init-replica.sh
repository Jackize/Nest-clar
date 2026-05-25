#!/bin/bash
set -e

if [ ! -s /var/lib/postgresql/data/PG_VERSION ]; then
  echo "Initializing replica from primary (slot: ${REPLICA_SLOT})..."
  until PGPASSWORD="${POSTGRES_REPL_PASSWORD}" pg_basebackup \
    -h postgres-primary \
    -U replicator \
    -D /var/lib/postgresql/data \
    -R \
    -X stream \
    -c fast \
    -S "${REPLICA_SLOT}"
  do
    echo 'Waiting for primary...'
    sleep 2
  done
  echo 'Replica backup complete!'
fi

exec docker-entrypoint.sh postgres
