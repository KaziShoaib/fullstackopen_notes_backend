//for hashing passwords
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');


usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('notes', { content: 1, date : 1 });
  // populate will take the ids in the notes field of the user model
  //then fetch Note Objects by those ids, there is a ref: 'Note' in the model definition
  //content : 1, date : 1 means we just want to see the content and date of the fetched note
  response.json(users);
});


usersRouter.post('/', async (request, response) => {
  const body = request.body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  const user = new User({
    username : body.username,
    name: body.name,
    passwordHash
  });
  const savedUser = await user.save();
  response.json(savedUser);
});

module.exports = usersRouter;