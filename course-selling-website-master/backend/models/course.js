const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  startDate: String,
  duration: String,
  level: String,
  language: String,
  mode: String,
  certificate: Boolean,
  imageUrl: String,
  availableSlots: Number
});

module.exports = mongoose.model('Course', CourseSchema);
