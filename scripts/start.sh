#!/bin/sh
set -eu
node scripts/seed-offers.mjs
node scripts/apply-offer-review.mjs --allow-conflicts
exec node server.js
