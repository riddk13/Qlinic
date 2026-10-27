const mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'staff', 'admin'], default: 'patient' },
}, { timestamps: true }));