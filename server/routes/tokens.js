const router = require('express').Router();
const Token = require('../models/Token');
const Counter = require('../models/Counter');
const Clinic = require('../models/Clinic');
const { protect, allow } = require('../middleware/auth');

const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const broadcast = (req, clinicId) =>
  req.app.get('io').to(String(clinicId)).emit('queue:update');

// Does this staff member own the clinic?
const ownsClinic = async (req, clinicId) => {
  if (req.user.role === 'admin') return true;
  const clinic = await Clinic.findById(clinicId);
  return clinic && String(clinic.ownerId) === req.user.id;
};

// 1. Book a token
router.post('/', protect, allow('patient'), async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!(await Clinic.findById(clinicId)))
      return res.status(404).json({ msg: 'Clinic not found' });

    const date = todayIST();
    const already = await Token.findOne({
      clinicId, patientId: req.user.id, date,
      status: { $in: ['waiting', 'in-progress'] },
    });
    if (already)
      return res.status(400).json({ msg: 'You already have an active token here' });

    const counter = await Counter.findOneAndUpdate(
      { key: `${clinicId}-${date}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const token = await Token.create({
      clinicId, patientId: req.user.id, tokenNumber: counter.seq, date,
    });
    broadcast(req, clinicId);
    res.status(201).json(token);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// 2. My tokens
router.get('/my', protect, async (req, res) => {
  res.json(
    await Token.find({ patientId: req.user.id })
      .sort('-createdAt')
      .populate('clinicId', 'name')
  );
});

// 3. Doctor: call next patient (blocked while the queue is paused)
router.patch('/call-next/:clinicId', protect, allow('staff', 'admin'), async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!(await ownsClinic(req, clinicId)))
      return res.status(403).json({ msg: 'This is not your clinic' });

    const clinicDoc = await Clinic.findById(clinicId);
    if (clinicDoc?.isPaused)
      return res.status(400).json({ msg: 'Queue is paused. Resume it first.' });

    const date = todayIST();
    await Token.updateMany(
      { clinicId, date, status: 'in-progress' },
      { status: 'done' }
    );

    const next = await Token.findOneAndUpdate(
      { clinicId, date, status: 'waiting' },
      { status: 'in-progress' },
      { sort: { isEmergency: -1, tokenNumber: 1 }, new: true }
    );
    if (!next) {
      broadcast(req, clinicId);
      return res.json({ msg: 'Queue is empty' });
    }

    req.app.get('io').to(String(clinicId)).emit('token:called', {
      tokenNumber: next.tokenNumber,
    });
    broadcast(req, clinicId);
    res.json(next);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// 4. Patient cancels own token
router.patch('/:id/cancel', protect, allow('patient'), async (req, res) => {
  const token = await Token.findOneAndUpdate(
    { _id: req.params.id, patientId: req.user.id, status: 'waiting' },
    { status: 'cancelled' },
    { new: true }
  );
  if (!token) return res.status(404).json({ msg: 'Token not found or cannot be cancelled' });
  broadcast(req, token.clinicId);
  res.json(token);
});

// 5. Doctor skips a token
router.patch('/:id/skip', protect, allow('staff', 'admin'), async (req, res) => {
  const found = await Token.findById(req.params.id);
  if (!found) return res.status(404).json({ msg: 'Token not found' });
  if (!(await ownsClinic(req, found.clinicId)))
    return res.status(403).json({ msg: 'This is not your clinic' });

  found.status = 'skipped';
  await found.save();
  broadcast(req, found.clinicId);
  res.json(found);
});

// 6. Doctor marks a token as emergency
router.patch('/:id/emergency', protect, allow('staff', 'admin'), async (req, res) => {
  const found = await Token.findById(req.params.id);
  if (!found) return res.status(404).json({ msg: 'Token not found' });
  if (!(await ownsClinic(req, found.clinicId)))
    return res.status(403).json({ msg: 'This is not your clinic' });

  found.isEmergency = true;
  await found.save();
  broadcast(req, found.clinicId);
  res.json(found);
});

module.exports = router;