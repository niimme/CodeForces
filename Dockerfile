FROM node:20-alpine AS base

# Install build tools and C++ compiler
RUN apk add --no-cache libc6-compat g++ clang make python3

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Install g++ and clang in runner container for backend C++ compilation sandbox
RUN apk add --no-cache g++ clang libc6-compat python3

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Copy built application
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 8080

CMD ["node", "server.js"]
