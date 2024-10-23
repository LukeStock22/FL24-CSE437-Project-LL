# Use a Node.js image to build the frontend
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the port Nginx runs on
EXPOSE 3000
