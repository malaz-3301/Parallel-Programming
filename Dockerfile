# ---------- Dependencies ----------
FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


# ---------- Build ----------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# انسخ كل ملفات مشروع NestJS، وليس مجلد final_docker_stack
COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]