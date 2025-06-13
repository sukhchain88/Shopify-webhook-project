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

# Debug: List the actual files in models directory
RUN echo "=== Files in src/models/ ===" && ls -la src/models/

# Debug: Check if TypeScript can see the files
RUN echo "=== TypeScript version ===" && npx tsc --version

# Create a temporary tsconfig for build that's more permissive
RUN echo '{\
  "compilerOptions": {\
    "target": "ES2020",\
    "lib": ["ES2020"],\
    "module": "CommonJS",\
    "moduleResolution": "node",\
    "outDir": "./dist",\
    "rootDir": "./src",\
    "strict": false,\
    "esModuleInterop": true,\
    "allowSyntheticDefaultImports": true,\
    "skipLibCheck": true,\
    "forceConsistentCasingInFileNames": false,\
    "resolveJsonModule": true,\
    "declaration": false,\
    "removeComments": true,\
    "noEmitOnError": false\
  },\
  "include": ["src/**/*"],\
  "exclude": ["node_modules", "dist"]\
}' > tsconfig.build.json

# Compile TypeScript with the permissive config
RUN npx tsc -p tsconfig.build.json

# Verify the build output
RUN echo "=== Build output ===" && ls -la dist/

# Expose port
EXPOSE 3000

# Start your app
CMD ["node", "dist/index.js"] 