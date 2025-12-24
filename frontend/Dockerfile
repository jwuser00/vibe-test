# Build stage
FROM node:24-alpine AS build

# COPY SKtelecom_Pxy.crt /usr/local/share/ca-certificates/
# RUN sed -i 's/https/http/g' /etc/apk/repositories
# RUN apk add --no-cache ca-certificates && update-ca-certificates
# ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
# ENV PIP_CERT=/etc/ssl/certs/ca-certificates.crt

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
