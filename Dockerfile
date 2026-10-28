# ─── domscrape: built from the crawler repository ─────────────────────────────
FROM node:24-alpine AS crawler

RUN apk add --no-cache git

# crawler-helper tag (or branch) to embed
ARG CRAWLER_REF=v0.0.3

RUN git clone --depth 1 --branch ${CRAWLER_REF} https://github.com/oudirichi/crawler-helper /crawler

WORKDIR /crawler

RUN npm ci && npm run build && npm prune --omit=dev

# ─── Base: Node + Chromium + pup + jq ─────────────────────────────────────────
FROM node:24-alpine AS base

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  jq \
  pup

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=crawler /crawler /opt/crawler
RUN chmod +x /opt/crawler/dist/cli.js && ln -s /opt/crawler/dist/cli.js /usr/local/bin/domscrape

WORKDIR /app

COPY scrape.json collect.sh parse.sh ./
RUN chmod +x collect.sh parse.sh

# ─── CI: tests parse.sh without a browser ─────────────────────────────────────
FROM base AS ci

COPY test ./test
RUN sh test/run.sh

# ─── Prod ─────────────────────────────────────────────────────────────────────
FROM base AS prod

USER node

ENTRYPOINT ["/app/collect.sh"]
