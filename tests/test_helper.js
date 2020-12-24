//helper for the note_api.test.js file

const Note = require('../models/note');
const User = require('../models/user');

const initialNotes = [
  {
    content: 'HTML is easy',
    date: new Date(),
    important: false
  },
  {
    content: 'Browser can execute only Javascript',
    date: new Date(),
    important: true
  }
];

const initialUser = {
  username: 'root',
  name: 'test-user',
  password: 'sekret'
};

const nonExistingId = async () => {
  const users = await User.find({});
  const user  = users[0];
  const note = new Note({
    content:'will delete soon',
    date: new Date(),
    important: false,
    user: user._id
  });
  await note.save();
  //we are not adding the note's id in the user object becuase the note will be deleted
  await note.remove();

  return note._id.toString();
};

const notesInDB = async () => {
  const notes = await Note.find({});
  return notes.map(note => note.toJSON());
};

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = { initialNotes, initialUser, nonExistingId, notesInDB, usersInDB };
