const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance:{type:Number,default :10000},
});

module.exports = mongoose.model("User", userSchema);