# Use an official Node.js runtime as a parent image
FROM node:22.10.0-slim

# Set the working directory
WORKDIR /app
# Install MongoDB and Redis
RUN apt-get update && \
    apt-get install -y gnupg wget && \
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 3B4FE6ACC0B21F32 && \
    echo "deb http://security.debian.org/debian-security buster/updates main" | tee -a /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y libssl1.1 mongodb-org redis-server && \
    rm -rf /var/lib/apt/lists/*
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn install 

# Copy the rest of the application code
COPY . .

# Install global dependencies for TypeScript
RUN yarn add tsc -g
RUN yarn add typescript -g
RUN yarn add ts-node -g
RUN yarn add ts-node-dev -g
RUN yarn add tsc-alias -g
RUN yarn build


# Make sure start.sh is copied and made executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose the port your app runs on
EXPOSE 5000

# Command to run the startup script
CMD ["./start.sh"]
