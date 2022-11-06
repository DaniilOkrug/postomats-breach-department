FROM node:18.11.0-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./ 
RUN yarn install --silent

COPY . ./

CMD ["yarn", "start"]