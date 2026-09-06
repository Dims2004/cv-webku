FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache \
    nodejs \
    npm

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application files
COPY src /usr/share/nginx/html

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]