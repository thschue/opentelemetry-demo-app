'use strict';

const express = require('express')
const tracer = require('../common/tracer')('node-frontend');
// eslint-disable-next-line import/order
const http = require('http');
const app = express()
const port = process.env.PORT
const backendHost = process.env.BACKEND_HOSTNAME
const backendPort = process.env.BACKEND_PORT

app.get('/main', async function (req, res) {
  const span = tracer.startSpan('makeRequest');
  tracer.withSpan(span, () => {
    http.get({
      host: backendHost,
      port: backendPort,
      path: '/helloworld',
    }, (response) => {
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => {
        res.send(JSON.stringify({hello:body.toString()}))
        console.log(body.toString());
        span.end();
      });
    });

  })
})

app.listen(
    port,
    function () {
      console.log(`Example app listening at http://localhost:${port}`)
    }
)