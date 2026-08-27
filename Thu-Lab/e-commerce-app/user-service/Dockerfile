# FROM base
FROM node:22-alpine

# WORKDIR /the/workdir/path
# setting the working directory
# all the commands will be executed inside this directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
# RUN npm install
RUN npm ci

# Copy application source code
COPY . .

# Expose port
EXPOSE 3000

# CMD ["executable"] - Runs the container
CMD ["npm", "run", "dev"]