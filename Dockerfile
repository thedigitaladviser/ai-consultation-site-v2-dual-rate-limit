FROM node:24-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

FROM node:24-bookworm-slim AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SQLITE_DB_PATH=/app/data/app.db

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/app ./app
COPY --from=build /app/components ./components
COPY --from=build /app/lib ./lib
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/next.config.mjs ./next.config.mjs

RUN mkdir -p /app/data \
  && chmod +x /app/scripts/run-scheduled-callbacks.sh

EXPOSE 3000

CMD ["npm", "start"]
