FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY upload-specification.html /usr/share/nginx/html/upload-specification.html
COPY upload-specification.css /usr/share/nginx/html/upload-specification.css
COPY upload-specification.js /usr/share/nginx/html/upload-specification.js

EXPOSE 80
