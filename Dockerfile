# Use official Node.js 20 base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies using npm
RUN npm install

# Build TypeScript
RUN npm run build

# Expose the port (change to your app's port if different)
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"] 