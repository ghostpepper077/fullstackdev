const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true
  },
  password: {
    type: String,
    required: true,
    maxlength: 100
  },
  dateOfBirth: String,
  gender: String,
  country: String,
  language: String,
  timeZone: String
});

module.exports = mongoose.model('MongoUser', UserSchema);
