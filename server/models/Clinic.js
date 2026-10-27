const mongoose = require('mongoose');

module.exports = mongoose.model('Clinic', new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  area: String,
  doctorName: String,
  openTime: String,
  closeTime: String,
  avgConsultTime: { type: Number, default: 10 }, // minutes
  isPaused: { type: Boolean, default: false },
  pauseMessage: { type: String, default: '' },
  resumeTime: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));