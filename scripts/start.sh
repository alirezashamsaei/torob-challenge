#!/bin/sh
set -eu
node scripts/seed-offers.mjs
exec node server.js
