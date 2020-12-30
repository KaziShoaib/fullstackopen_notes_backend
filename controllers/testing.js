//this route will be used by cypress test for cleaning the test database
const testingRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');


testingRouter.post('/reset', async (request, response) => {
  await User.deleteMany({});
  await Note.deleteMany({});

  response.status(204).end();
});

module.exports = testingRouter;