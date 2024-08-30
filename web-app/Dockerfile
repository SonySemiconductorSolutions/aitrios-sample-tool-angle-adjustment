# Stage 1: Build the React app
FROM node:20-alpine AS basebuild

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the app using a lightweight Node.js image
FROM node:20-alpine

# Create a non-root user
RUN addgroup -S reactgroup && adduser -S caatuser -G reactgroup

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.3

# Copy the built React app from the previous stage
COPY --from=basebuild /app/build ./build

# Ensure the 'caatuser' has permission to write to the directory
RUN chown -R caatuser:reactgroup /app

# Set the user to 'caatuser'
USER caatuser

# Expose the port that the app runs on
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "build"]
