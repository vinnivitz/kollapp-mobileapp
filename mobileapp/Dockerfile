FROM node:24-alpine AS base
WORKDIR /app
RUN npm -g install pnpm

FROM base AS builder
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
ENV VITE_API_URL=https://api.kollapp.org/api
COPY . .
RUN pnpm validate
RUN pnpm build-web

FROM base AS runner
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/build ./build

STOPSIGNAL SIGTERM
EXPOSE 3000
CMD ["node", "build"]