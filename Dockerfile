# Use the same Node.js version as your local environment for the base image
FROM node:16.0.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Set environment variables
ENV PORT=3000

# Copy package.json and package-lock.json
COPY package*.json ./



# Run npm install
RUN npm install --ignore-scripts

# Copy the current directory contents into the container
COPY . .

# Run post-install steps
RUN npm run prepare
RUN chmod ug+x .husky/*
RUN chmod ug+x .git/hooks/*
RUN npm install 
# Running npm install again to execute any scripts

# Additional global installations
RUN npm install -g react-scripts foreman husky prettier lint-staged git-authors-cli

# Run npm start for development. For production, you can use CMD ["npm", "run", "build"]
CMD ["npm", "start"]
