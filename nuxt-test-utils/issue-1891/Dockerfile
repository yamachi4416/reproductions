FROM node:24

ENV CI=true

RUN corepack enable

WORKDIR /app

COPY . .
RUN pnpm install --update-checksums --no-frozen-lockfile

CMD ["pnpm", "test"]
