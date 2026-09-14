# FROM baseImage
FROM node:22-alpine

# Working directory of Docker
WORKDIR /app

# Copy package files first to root directory of Docker
COPY package*.json ./

# Install node dependencies
# RUN npm install
# Use cache install for faster installation of dependencies
RUN npm ci

# Copy all remaining files and paste in app directory
COPY . .

EXPOSE 3000

# CMD ["npm", "run", "dev"]
CMD ["node", "app.js"]