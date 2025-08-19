FROM node:24.5.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production && npm install -g npm@latest

COPY . .

EXPOSE 2214
CMD ["npm", "start"]
