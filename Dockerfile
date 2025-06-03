FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate

CMD ["npm", "run", "dev"]
