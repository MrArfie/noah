const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  breed: { type: String, required: true },
  vaccinated: { type: Boolean, default: false },
  story: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model('Pet', PetSchema);
