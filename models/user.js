const mongoose = require('mongoose');
//for imposing uniqueness
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
});


userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    //the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  }
});

//the uniqueValidator has to be plugged in
userSchema.plugin(uniqueValidator);


const User = mongoose.model('User', userSchema);
module.exports = User;