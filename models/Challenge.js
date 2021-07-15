const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ChallengeSchema = new Schema({
  i:{
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },

  inputTypes: {
    type: Array,
    required: true
   },
   inputVarNames: {
       type: Array,
       required: true
   },

   outputType: {
    type: String,
    required: true
   },

  inputs: {
    type: Array,
    required: true
  },
  outputs: {
    type: Array,
    required: true
  },

  methodName: {
      type:String,
      required: true
  },

  dataStructure: {
      type: String,
      required: true
  },

  imports: {
    type: String,
    required: true

  }

});
module.exports = Challenge = mongoose.model("challenges", ChallengeSchema);