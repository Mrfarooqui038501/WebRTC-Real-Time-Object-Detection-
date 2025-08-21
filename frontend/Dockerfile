# -------- Build Stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# -------- Serve Stage --------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy build output to nginx html
COPY --from=build /app/dist ./

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
