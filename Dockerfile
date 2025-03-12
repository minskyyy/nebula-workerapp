# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the static files to the Nginx HTML directory
COPY index.html /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY images /usr/share/nginx/html/images/
COPY styles /usr/share/nginx/html/styles/
COPY scripts /usr/share/nginx/html/scripts/
COPY font-icon /usr/share/nginx/html/font-icon/

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]  