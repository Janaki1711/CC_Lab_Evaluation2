FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Default placeholder index.html until frontend build is copied
RUN mkdir -p /usr/share/nginx/html && \
    echo '{"platform":"Academic Kubernetes Intelligent Placement System","status":"online"}' > /usr/share/nginx/html/index.html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
