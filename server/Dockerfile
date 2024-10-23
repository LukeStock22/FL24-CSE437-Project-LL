# Use a Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to take advantage of Docker cache
COPY package.json /app
COPY package-lock.json /app

# Install dependencies (this will include bcrypt)
RUN npm install

# Copy the rest of the application files
COPY . /app

# Expose port 4000 for the backend
EXPOSE 4000

# Command to run the backend
CMD ["node", "server.js"]