# # Stage 1: Build stage
# FROM node:22-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# EXPOSE 8000

# COPY . .

# Stage 2: Production stage
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm i
COPY prisma.config.ts ./
COPY . .

EXPOSE 8000
# CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
CMD ["sh", "-c", "npm run db:deploy && npm run"]


