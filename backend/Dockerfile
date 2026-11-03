FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 8000

CMD [ "node", "index.js" ]
