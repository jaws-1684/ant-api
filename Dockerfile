FROM node:24 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y git

COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build


COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 80

CMD ["npm", "start"]