FROM node:24.11.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma.config.ts ./

CMD ["sh", "-c", "npx prisma generate && npm run dev"]
