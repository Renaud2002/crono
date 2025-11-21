FROM node:25-alpine3.21

WORKDIR /crono

COPY . .

RUN npm install

CMD ["node", "index.js"]