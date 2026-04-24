# ------------ BUILD STAGE ------------
FROM node:24-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
RUN npm run lint
RUN npm run test

# ------------ PRODUCTION STAGE ------------
FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

EXPOSE 3000

RUN apk add --no-cache curl

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3000/ || exit 1

CMD ["node", "./build/index.js"]
