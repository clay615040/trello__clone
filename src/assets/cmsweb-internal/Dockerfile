# gcr.io/audere-cms-stage/cms-vue-base:v1
#
# FROM node:14.15.2
# WORKDIR /usr/src/app
# COPY ./source/package.json  ./
# RUN npm install yarn && yarn install

FROM gcr.io/audere-cms-stage/cms-vue-base:v2 as build-deps
WORKDIR /usr/src/app
COPY ./source  ./
ARG VENV
ARG VERSION
ENV VERSION $VERSION

RUN yarn install && npm run build:$VENV

# Nginx
FROM nginx:1.18.0-alpine

# COPY ./html /usr/share/nginx/html
COPY --from=build-deps /usr/src/app/dist /usr/share/nginx/html
COPY ./conf /etc/nginx

EXPOSE 8080