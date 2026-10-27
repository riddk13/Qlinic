const mongoose = require('mongoose');

module.exports = mongoose.model('Token', new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenNumber: Number,
  date: String,
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'done', 'skipped', 'cancelled'],
    default: 'waiting',
  },
  isEmergency: { type: Boolean, default: false },
}, { timestamps: true }));