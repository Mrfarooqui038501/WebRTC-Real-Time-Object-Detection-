FROM node:20-slim

WORKDIR /app

# Install system deps required for sharp
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    make \
    libc6-dev \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first (better cache)
COPY package*.json ./

# Default to production, can override with docker-compose
ARG MODE=production
ENV NODE_ENV=$MODE

# Install dependencies
RUN if [ "$MODE" = "development" ]; then \
      npm install --include=dev --include=optional; \
    else \
      npm install --omit=dev --include=optional; \
    fi

# Copy source
COPY src ./src

EXPOSE 8080

# Default command
CMD ["npm", "start"]
