# FROM baseImage:tag
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# COPY source destination
COPY package*.json ./

# Install dependencies
# Why ci - because Docker can reuse the dependency layer from cache
# RUN npm ci
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm ci; \
    else npm install --only=production; \
    fi

# Copy rest of the application
COPY . .

# Application listens on PORT-4545
EXPOSE 4545

# Start the application
# CMD ["npm", "run", "dev"]
CMD ["node", "server.js"]

