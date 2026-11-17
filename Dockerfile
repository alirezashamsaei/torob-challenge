FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ENV NEXT_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public && npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/docs/stock-laptop-offer-sample.csv ./docs/stock-laptop-offer-sample.csv
RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["sh", "scripts/start.sh"]
