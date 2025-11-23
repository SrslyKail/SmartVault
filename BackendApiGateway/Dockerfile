# # Stage 1: Build stage
# FROM node:22-alpine AS builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# EXPOSE 8000

# COPY . .

# # === Development ===
# FROM node:22-alpine AS development

# WORKDIR /app

# COPY package.json ./
# RUN npm i
# COPY prisma.config.ts ./
# COPY . .

# EXPOSE 8000
# # CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
# CMD ["sh", "-c", "npm run db:deploy && npm run build && npm run start"]


# === Production ===
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm i
COPY prisma.config.ts ./
COPY . .

EXPOSE 8001

CMD ["sh", "-c", "npm run db:deploy && npm run build && npm run start"]
