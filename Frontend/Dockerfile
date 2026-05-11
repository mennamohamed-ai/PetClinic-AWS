FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV VITE_APP_API_URL=http://petclinic-prod-alb-2142133629.us-east-1.elb.amazonaws.com:9090

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9090

CMD ["nginx", "-g", "daemon off;"]