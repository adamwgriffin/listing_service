#!/bin/bash

mongorestore \
  --username "$DB_USER" \
  --password "$DB_PASSWORD" \
  --authenticationDatabase admin \
  --archive=/docker-entrypoint-initdb.d/db.dump.archive.gz --gzip \
  --gzip
