const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: Number,
    required: true
  },
  isCoolDown: {
    type: Boolean,
    required: true
  },
  coolDownEnd: {
    type: Number,
    required: true
  },

  isCompetitive: {
    type: Boolean,
    required: true
  }
});
module.exports = User = mongoose.model("users", UserSchema);