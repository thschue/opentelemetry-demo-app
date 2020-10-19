'use strict';

const mongodb = require('mongodb');
const tracer = require('../common/tracer')('node-backend');
// eslint-disable-next-line import/order
const http = require('http');
const port = process.env.PORT
const mongoHost = process.env.MONGO_HOSTNAME
const mongoPort = process.env.MONGO_PORT


/** Starts a HTTP server that receives requests on sample server port. */
function startServer(port) {
  // Creates a server
  const server = http.createServer(handleRequest);
  // Starts the server
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Node HTTP listening on ${port}`);
  });
}

function doMongoRequest() {
  const MongoClient = require('mongodb').MongoClient
  const url = 'mongodb://' + mongoHost + ':' + mongoPort + "/mydatabase";

  let random_string = Math.random().toString(36).substring(7)

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!");

    let dbo = db.db("mydb");

    let myobj = {random_string: random_string} ;

    dbo.collection("random_strings").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });

    db.close();
  });

  return random_string;
}

/** A function which handles requests and send response. */
function handleRequest(request, response) {
  const currentSpan = tracer.getCurrentSpan();
  // display traceid in the terminal
  console.log(`traceid: ${currentSpan.context().traceId}`);
  const span = tracer.startSpan('handleRequest', {
    parent: currentSpan,
    kind: 1, // server
    attributes: { key: 'value' },
  });
  // Annotate our span to capture metadata about the operation
  span.addEvent('getting DatabaseVersion');
  let random_string = doMongoRequest()
  span.addEvent('invoking handleRequest');
  try {
    const body = [];
    request.on('error', (err) => console.log(err));
    request.on('data', (chunk) => body.push(chunk));
    request.on('end', () => {
      // deliberately sleeping to mock some action.
      setTimeout(() => {
        span.end();
        response.end(random_string);
      }, 2000);
    });
  } catch (err) {
    console.error(err);
    span.end();
  }
}

startServer(port);
