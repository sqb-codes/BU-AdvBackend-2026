# FROM BaseImage
FROM node:22-alpine

# Working directory inside Docker environment
WORKDIR /app

# COPY package files
COPY package*.json ./

# Install dependencies
# RUN npm install
# Install dependencies first and then later get from cache
RUN npm ci

# Copy all the remaining files from source to destination
# source - my local working directory
# destination - app directory inside Docker
COPY . .

# EXPOSE Container on PORT
EXPOSE 3000

# Docker will run this command - npm run dev
CMD ["npm", "run", "dev"]