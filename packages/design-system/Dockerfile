# Multi-stage build for UI Storybook
FROM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install build dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for all packages for proper dependency installation
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/configs/eslint-config/package.json ./packages/configs/eslint-config/
COPY packages/configs/playwright-config/package.json ./packages/configs/playwright-config/
COPY packages/configs/rsbuild-config/package.json ./packages/configs/rsbuild-config/
COPY packages/configs/tailwind-config/package.json ./packages/configs/tailwind-config/
COPY packages/configs/typescript-config/package.json ./packages/configs/typescript-config/
COPY packages/configs/vitest-config/package.json ./packages/configs/vitest-config/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter=@wallarm/design-system...

# Build Storybook
FROM base AS builder
WORKDIR /app

# Copy node_modules from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

# Build configs
RUN pnpm build:configs

# Build Storybook
RUN pnpm --filter=@wallarm/design-system build-storybook

# Production stage - Nginx for static files
FROM nginx:alpine AS production

# Copy built Storybook
COPY --from=builder /app/packages/design-system/storybook-static /usr/share/nginx/html

# Nginx configuration for Storybook
COPY packages/design-system/nginx.conf /etc/nginx/conf.d/default.conf

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
