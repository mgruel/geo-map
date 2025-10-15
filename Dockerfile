# ------------ BUILD STAGE ------------
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
RUN npm run lint
RUN npm run test

# ------------ PRODUCTION STAGE ------------
FROM node:20-alpine AS production

WORKDIR /app

EXPOSE 3000

RUN apk add --no-cache curl

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "./build/index.js"]
