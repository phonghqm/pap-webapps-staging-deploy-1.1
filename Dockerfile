FROM node:18-alpine AS builder
ENV NODE_ENV production
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm i -g patch-package && npm install
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
