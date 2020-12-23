// tests for the backend of notes api

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const api = supertest(app);
const Note = require('../models/note');

const bcrypt = require('bcrypt');
const User = require('../models/user');

beforeEach(async () => {
  await Note.deleteMany({});
  //console.log('cleared');

  // saving all the notes in the initialNotes array with forEach does not work
  // the reason is the entire beforeEach is an async fucntion
  // and the forEach is also a collection of async functions
  // beforeEach won't wait for the forEach functions to finish execution
  // more on this here : "https://fullstackopen.com/en/part4/testing_the_backend#optimizing-the-before-each-function"
  // we can use the "for --- of" instead
  // helper.initialNotes.forEach(async (note) => {
  //   let noteObject = new Note(note);
  //   await noteObject.save();
  //   console.log('saved');
  // });

  for (let note of helper.initialNotes){
    let noteObject = new Note(note);
    await noteObject.save();
    //console.log('saved');
  }

  //console.log('done');
});

describe('when there is initially some notes saved', () => {

  //console.log('entered test');

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });


  test('all notes are returned', async () => {
    const response = await api.get('/api/notes');
    expect(response.body).toHaveLength(helper.initialNotes.length);
  });


  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');
    const contents = response.body.map(r => r.content);
    expect(contents).toContain(helper.initialNotes[1].content);
  });

});


describe('viewing a specific note', () => {

  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDB();
    const noteToView = notesAtStart[0];
    const response = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    // the object returned by the router is inside response.body
    const returnedNote = response.body;
    //this processing is necessary for matching dates
    const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
    expect(returnedNote).toEqual(processedNoteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId();
    //console.log(validNonExistingId);
    await api
      .get(`/api/notes/${validNonExistingId}`)
      .expect(404);
  });


  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';
    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400);
  });

});


describe('addition of a new note', () => {

  test('succeeds with valid data', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);
    const contents = notesAtEnd.map(n => n.content);
    expect(contents).toContain(newNote.content);
  });


  test('fails with status code 400 if data invaild', async () => {
    const newNote = {
      important : false
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400);

    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });

});


describe('deletion of a note', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDB();
    const noteToDelete = notesAtStart[0];

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204);

    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

    const contents = notesAtEnd.map(r => r.content);
    expect(contents).not.toContain(noteToDelete.contain);
  });


});


describe('when there is initially one user in DB', () => {

  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });
    await user.save();
  });


  test('user creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDB();
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });


  test('user creation fails with a proper statuscode and message if username is already taken', async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: 'root',
      name: 'superuser',
      password: 'salainen'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});


afterAll(() => {
  mongoose.connection.close();
});