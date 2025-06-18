FROM node:23-alpine AS build 

WORKDIR /app

COPY package.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:23-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

RUN mkdir -p /app/cache && chown nextjs:nodejs /app/cache

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static


ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]