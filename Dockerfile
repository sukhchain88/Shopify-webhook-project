# Use Node.js 20 as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using npm (not Bun)
RUN npm install

# Copy all project files
COPY . .

# Compile TypeScript to JavaScript (ignore errors for now)
RUN npx tsc --noEmitOnError false || npx tsc --skipLibCheck

# Expose port (change this if your app uses a different one)
EXPOSE 3000

# Start your app
CMD ["node", "dist/index.js"] 