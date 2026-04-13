FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Create uploads dir
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/index.js"]
