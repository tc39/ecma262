#!/bin/sh

set -ex

npm run build-master

if [ "${CONTEXT}" != 'production' ]; then
  node scripts/insert_snapshot_warning
fi
