

COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build

FROM node:24.14.0-slim AS builder
RUN apt-get update && apt-get install -y git
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 80

CMD ["npm", "start"]