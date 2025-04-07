FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .

COPY public/config.js.template ./config.js.template
RUN envsubst < ./config.js.template > ./config.js

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
