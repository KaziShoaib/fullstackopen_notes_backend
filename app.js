const config = require('./utils/config');
const express = require('express'); //for express
/*
we can remove the try catch blocks from the routers inside controllers
with the express-async-errors library
if an exception occurs in an async function this library will automatically
forward that to the error handler middleware
*/
require('express-async-errors');
const app = express();
const cors = require('cors'); // for connecting with the frontend
const notesRouter = require('./controllers/notes'); // loading note route controllers
const usersRouter = require('./controllers/users'); // loading user route controllers
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');


logger.info('connecting to ',config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch(error => {
    logger.error('error connecting to MongoDB : ', error.message);
  });


app.use(cors());
app.use(express.static('build'));  // connecting the production build of front end
app.use(express.json()); // for parsing json data from request.body
app.use(middleware.requestLogger);


app.use('/api/notes', notesRouter); // assigning the base URL to the route controllers
app.use('/api/users', usersRouter); // assigning the base URL to the route cntrollers

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

