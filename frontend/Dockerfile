FROM node

COPY frontend/main.js /app/main.js
COPY common/tracer.js /common/tracer.js
COPY frontend/package.json /app/package.json
COPY common/package.json /common/package.json

WORKDIR /app

RUN npm install /common/
RUN npm install

CMD [ "node", "main.js" ]
