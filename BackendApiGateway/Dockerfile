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

COPY package*.json ./
# COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

EXPOSE 8000

# COPY --from=builder /app/src ./src

ENTRYPOINT ["npm", "start"]
