#!/usr/bin/env bash

docker-compose exec -T mongodb sh -c '
  mongodump \
    --archive \
    --gzip \
    --username "$DB_USER" \
    --password "$DB_PASSWORD" \
    --authenticationDatabase admin \
    --db "$DB_NAME"
' > ./docker/init-mongo/db.dump.archive.gz

