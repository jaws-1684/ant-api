FROM node:24 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y git

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]