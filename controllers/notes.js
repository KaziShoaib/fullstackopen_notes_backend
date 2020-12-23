const notesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Note = require('../models/note');
const User = require('../models/user');


notesRouter.get('/', async (request, response) => {
  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 });
  //the populate method will take the id from the user field of the note objects
  //then fetch user objects using those ids, there is a ref : 'User' in the model definition
  //username :1, name: 1 means that we just want to see the name and username of the user
  //who created the note
  response.json(notes);
});


notesRouter.get('/:id', async (request, response, next) => {
  // try {
  //   const note = await Note.findById(request.params.id);
  //   if(note){
  //     response.json(note);
  //   }
  //   else{
  //     response.status(404).end();
  //   }
  // } catch(exception){
  //   next(exception);
  //}

  // we can do remove the try catch block from here because we have the
  // express-async-errors library
  // if any exception occurs the library will automatically transfer that
  // to the error handler middleware
  // the next in the parameters is not required anymore but it is left there
  //for future reference

  const note = await Note.findById(request.params.id);
  if(note){
    response.json(note);
  }
  else{
    response.status(404).end();
  }

});


//a function to check if there is a token with the post requests
const getTokenFrom = request => {
  const authorization = request.get('authorization'); // the token is sent under the request header 'authorziation'
  // the name of the used scheme is bearer
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring(7);
  }

  return null;
};


notesRouter.post('/', async (request, response, next) => {
  const body = request.body;

  const token = getTokenFrom(request); //getting the authorization token from request using the function defined above
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if(!(token && decodedToken.id)){
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(decodedToken.id);

  let note = new Note({
    content : body.content,
    date : new Date(),
    important : body.important || false,
    user : user._id
  });

  // try {
  //   const savedNote = await note.save();
  //   response.json(savedNote);
  // } catch(exception) {
  //   next(exception);
  // }

  // we can do remove the try catch block from here because we have the
  // express-async-errors library
  // if any exception occurs the library will automatically transfer that
  // to the error handler middleware
  // the next in the parameters is not required anymore, but it is left there
  //for future reference

  const savedNote = await note.save();

  //adding the savedNotes' id to the user's notes list
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  response.json(savedNote);
});


notesRouter.delete('/:id', async (request, response, next) => {
  // try{
  //   await Note.findByIdAndDelete(request.params.id);
  //   response.status(204).end();
  // } catch(exception) {
  //   next(exception);
  // }

  // we can do remove the try catch block from here because we have the
  // express-async-errors library
  // if any exception occurs the library will automatically transfer that
  // to the error handler middleware
  // the next in the parameters is not required anymore but it is left there
  //for future reference

  await Note.findByIdAndDelete(request.params.id);
  response.status(204).end();
});


// one old school router with .then chains left for reference
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body;

  // the edited object is not a Note model, it is a normal javascript object
  const note = {
    content: body.content,
    important: body.important
  };

  //normally validators don't work while editing
  //adding runValidators : true will enforce validations during editing
  //normally findByIdAndUpdate returns the old object
  // new : true will make it return the new edited object
  Note.findByIdAndUpdate(request.params.id, note, { new : true, runValidators: true })
    .then(updatedNote => {
      if(updatedNote){
        response.json(updatedNote.toJSON());
      }
      else {
        response.status(404).end();
      }
    })
    .catch(error => next(error)); //sending error the errorHandler middleware
});


module.exports = notesRouter;