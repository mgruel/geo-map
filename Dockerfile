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

ENV NODE_ENV=production
WORKDIR /app

EXPOSE 3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["node", "-e", "require('http').get('http://localhost:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]

CMD ["node", "./build/index.js"]
