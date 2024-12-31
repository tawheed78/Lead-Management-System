# Stage 1: Build the application
FROM node:18.17.0 AS builder

# Set the working directory
WORKDIR /lead-management-app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY package-lock*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Serve the application
FROM node:18.17.0

# Set the working directory
WORKDIR /lead-management-app

# Copy only the necessary files from the build stage
COPY --from=builder lead-management-app/package*.json ./
COPY --from=builder lead-management-app/.next ./.next
# COPY --from=builder lead-management-app/public ./public

# Install production dependencies
RUN npm install --production

# Expose the port
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start"]
