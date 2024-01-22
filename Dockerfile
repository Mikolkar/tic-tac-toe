FROM node:20.6.1-slim

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
