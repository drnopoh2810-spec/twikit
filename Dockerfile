# ==================== Build Stage ====================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ==================== Production Stage ====================
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY public ./public

# Create required directories
RUN mkdir -p data uploads && chown -R node:node data uploads

# HuggingFace Spaces requires port 7860
ENV PORT=7860
ENV NODE_ENV=production

# Non-root user
USER node

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:7860/health || exit 1

CMD ["node", "dist/server.js"]
