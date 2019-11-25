FROM node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
CMD [ "npm", "run", "serve" ]

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install 

# Bundle app source
COPY . /usr/src/app

# Build the built version
RUN npm run build

# Remove dev packages
RUN npm prune --production

EXPOSE 4000