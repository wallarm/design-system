# Multi-stage build for web application
FROM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install build dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for all packages for proper dependency installation
COPY apps/playground/package.json ./apps/playground/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/configs/eslint-config/package.json ./packages/configs/eslint-config/
COPY packages/configs/playwright-config/package.json ./packages/configs/playwright-config/
COPY packages/configs/rsbuild-config/package.json ./packages/configs/rsbuild-config/
COPY packages/configs/tailwind-config/package.json ./packages/configs/tailwind-config/
COPY packages/configs/typescript-config/package.json ./packages/configs/typescript-config/
COPY packages/configs/vitest-config/package.json ./packages/configs/vitest-config/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter=@wallarm-org/playground...

# Build application
FROM base AS builder
WORKDIR /app

# Copy node_modules from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/playground/node_modules ./apps/playground/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

# Build configs
RUN pnpm build:configs

# Build design-system library
RUN pnpm --filter=@wallarm-org/design-system build

# Build playground application
RUN pnpm --filter=@wallarm-org/playground build

# Production stage - Nginx for static files
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/apps/playground/dist /usr/share/nginx/html

# Nginx configuration for SPA
COPY apps/playground/nginx.conf /etc/nginx/conf.d/default.conf

# Configure nginx to run without root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start command
CMD ["nginx", "-g", "daemon off;"]
