FROM node:20-alpine AS deps
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc

FROM node:20-alpine AS runtime
RUN apk update && apk upgrade && apk add --no-cache tini && rm -rf /var/cache/apk/*
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="j-parking-backend" \
  org.opencontainers.image.vendor="Aadrika Enterprises"
RUN addgroup -g 1001 -S dockeruser && adduser -S dockeruser -u 1001 -G dockeruser
WORKDIR /app
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --chown=dockeruser:dockeruser --from=build /app/build ./build
USER dockeruser
EXPOSE 6002
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "(async()=>{try{const r=await fetch('http://localhost:6002/');if(!r.ok)throw 1;process.exit(0)}catch{process.exit(1)}})()"]
ENTRYPOINT ["tini", "--"]
CMD ["node", "build/src/server.js"]
