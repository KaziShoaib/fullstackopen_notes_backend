const notesRouter = require('express').Router();
const Note = require('../models/note');


notesRouter.get('/', (request, response) => {
  Note.find({})
    .then(returnedNotes => returnedNotes.map(note => note.toJSON()))
    .then(returnedAndFormattedNotes => response.json(returnedAndFormattedNotes));
});


notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if(note){
        response.json(note.toJSON());
      }
      else{
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});


notesRouter.post('/', (request, response, next) => {
  const body = request.body;
  if(body.content === undefined){
    return response.status(400).json({ error: 'content missing' });
  }

  let note = new Note({
    content : body.content,
    date : new Date(),
    important : body.important || false,
  });

  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => response.json(savedAndFormattedNote))
    .catch(error => next(error));
});


notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error));
});


notesRouter.put('/:id', (request, response, next) => {
  const body = request.body;

  // the edited object is not a Note model, it is a normal javascript object
  const note = {
    content: body.content,
    important: body.important
  };

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