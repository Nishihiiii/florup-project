FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S florup && adduser -S florup -G florup
COPY --from=build --chown=florup:florup /app/node_modules ./node_modules
COPY --from=build --chown=florup:florup /app/package*.json ./
COPY --from=build --chown=florup:florup /app/prisma ./prisma
COPY --from=build --chown=florup:florup /app/src ./src
USER florup
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
