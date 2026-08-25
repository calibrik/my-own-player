FROM node:24-alpine AS frontend
WORKDIR /src
COPY ./package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

FROM nginx:alpine AS final
WORKDIR /app
RUN rm /etc/nginx/conf.d/default.conf
# nginx.conf.template is rendered at container start by the official nginx image's
# envsubst entrypoint, injecting VITE_TMDB_API_KEY (from the container env) into the
# proxy config. No ENTRYPOINT override, so the default entrypoint handles that.
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=frontend /src/dist /usr/share/nginx/html
EXPOSE 80