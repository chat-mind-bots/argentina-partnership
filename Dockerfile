FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install the dependencies using yarn
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the port on which the NestJS server will listen
EXPOSE 3000

# Start the NestJS server in production mode
CMD ["yarn", "start:prod"]
