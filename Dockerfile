FROM node:20-alpine

RUN npm install -g pnpm

RUN mkdir -p /app/ && chown -R node:node /app

COPY --chown=node:node ./ /app/

WORKDIR /app/server

USER node

RUN ls -la /app/

RUN pnpm i

RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]