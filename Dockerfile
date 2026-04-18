FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/.output/public ./public
EXPOSE 3000
CMD ["serve", "-s", "public", "-l", "3000"]
