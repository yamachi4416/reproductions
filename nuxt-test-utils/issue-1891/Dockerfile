FROM node:24

ENV CI=true

RUN corepack enable

WORKDIR /app

COPY . .
RUN pnpm install --update-checksums --no-frozen-lockfile \
  && pnpm --dir min-ver-happy-dom-msw2 install --update-checksums --no-frozen-lockfile \
  && pnpm --dir min-ver-happy-dom-msw3 install --update-checksums --no-frozen-lockfile

CMD ["pnpm", "test"]
