const { response, request } = require('express');
const express = require('express');   //for express
const app = express()

const cors = require('cors') // for connecting with the frontend
app.use(cors())

app.use(express.json())  // for parsing json data from request.body
app.use(express.static('build'))   // connecting the production build of front end

require('dotenv').config() // accessing environment variables from the .env file

// request logger middleware
const requestLogger = (request, response, next) =>{
  console.log("Method: ",request.method);
  console.log("Path: ",request.path);
  console.log("Body: ",request.body);
  console.log('---');
  next();
}
app.use(requestLogger);


const Note = require('./models/note');  //importing the Note model from the models directory


app.get('/api/notes', (request, response)=>{
  Note.find({})
    .then(returnedNotes => returnedNotes.map(note => note.toJSON()))
    .then(returnedAndFormattedNotes => response.json(returnedAndFormattedNotes))
})


app.get('/api/notes/:id', (request, response, next)=>{
  Note.findById(request.params.id)
    .then(note=>{
      if(note){
        response.json(note.toJSON());
      }
      else{        
        response.status(404).end();
      }
    })
    .catch(error=> next(error))
}) 


app.delete('/api/notes/:id', (request, response, next)=>{
  Note.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})


app.post('/api/notes', (request, response, next)=>{
  
  const body = request.body
  if(body.content === undefined){
    return response.status(400).json({error: 'content missing'})
  }

  let note = new Note({
    content : body.content,
    date : new Date(),
    important : body.important || false,
  })

  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => response.json(savedAndFormattedNote))  
    .catch(error => next(error))
})


app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body;

  // the edited object is not a Note model, it is a normal javascript object
  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, {new : true, runValidators: true})
    .then(updatedNote => updatedNote.toJSON())
    .then(updatedAndFormattedNote => response.json(updatedAndFormattedNote)) 
    .catch(error => next(error)) //sending error the errorHandler middleware
})


// unknonw endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({error : 'unknown endpoint'})
}
app.use(unknownEndpoint);


//error Handler middleware
const erorHandler = (error, request, response, next) => {
  console.log(error.message);
  if(error.name === 'CastError'){    
    return response.status(400).send({error : 'malformatted id'});
  }
  else if(error.name === 'ValidationError'){
    return response.status(400).json({error: error.message})
  }
  next(error);
}
app.use(erorHandler);


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})