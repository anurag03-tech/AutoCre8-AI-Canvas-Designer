# Use Node 20 (required for Next.js v16+)
FROM node:20-alpine

# Create app directory inside container
WORKDIR /app

# First copy only package files to use cached docker layers
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy full project to container
COPY . .

# Expose dev port
EXPOSE 3000

# Default command to start dev server
CMD ["npm", "run", "dev"]
