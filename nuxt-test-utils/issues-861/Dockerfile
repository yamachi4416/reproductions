FROM node:24

ENV CI=true

RUN corepack enable

WORKDIR /app

COPY . .
RUN pnpm install
RUN pnpm playwright install --with-deps chromium

CMD ["pnpm", "test"]
