const router = require('express').Router();
const Clinic = require('../models/Clinic');
const Token = require('../models/Token');
const { protect, allow } = require('../middleware/auth');

const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EDITABLE = ['name', 'address', 'area', 'doctorName', 'openTime', 'closeTime', 'avgConsultTime'];

// Returns the clinic if the user owns it, otherwise sends an error and returns null
const getOwnedClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      res.status(404).json({ msg: 'Clinic not found' });
      return null;
    }
    if (req.user.role !== 'admin' && String(clinic.ownerId) !== req.user.id) {
      res.status(403).json({ msg: 'This is not your clinic' });
      return null;
    }
    return clinic;
  } catch {
    res.status(400).json({ msg: 'Invalid clinic id' });
    return null;
  }
};

// Create clinic (staff/admin)
router.post('/', protect, allow('staff', 'admin'), async (req, res) => {
  try {
    const clinic = await Clinic.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(clinic);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// My clinics (must stay above '/:id')
router.get('/mine', protect, allow('staff', 'admin'), async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { ownerId: req.user.id };
  res.json(await Clinic.find(filter).sort('-createdAt'));
});

// List clinics with live status  (?search=dehradun)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [
          { name: new RegExp(escapeRegex(search), 'i') },
          { area: new RegExp(escapeRegex(search), 'i') },
        ] }
      : {};
    const date = todayIST();
    const clinics = await Clinic.find(filter).lean();
    const result = await Promise.all(clinics.map(async (c) => {
      const waitingCount = await Token.countDocuments({
        clinicId: c._id, date, status: 'waiting',
      });
      const current = await Token.findOne({
        clinicId: c._id, date, status: 'in-progress',
      });
      return { ...c, waitingCount, nowServing: current ? current.tokenNumber : null };
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Single clinic detail
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ msg: 'Clinic not found' });
    res.json(clinic);
  } catch {
    res.status(400).json({ msg: 'Invalid clinic id' });
  }
});

// Edit clinic (owner only)
router.put('/:id', protect, allow('staff', 'admin'), async (req, res) => {
  const clinic = await getOwnedClinic(req, res);
  if (!clinic) return;
  EDITABLE.forEach((k) => {
    if (req.body[k] !== undefined) clinic[k] = req.body[k];
  });
  await clinic.save();
  res.json(clinic);
});

// Delete clinic and its tokens (owner only)
router.delete('/:id', protect, allow('staff', 'admin'), async (req, res) => {
  const clinic = await getOwnedClinic(req, res);
  if (!clinic) return;
  await Token.deleteMany({ clinicId: clinic._id });
  await clinic.deleteOne();
  res.json({ msg: 'Clinic deleted' });
});

// Patient history for a date (owner only)  (?date=2026-10-27)
router.get('/:id/history', protect, allow('staff', 'admin'), async (req, res) => {
  const clinic = await getOwnedClinic(req, res);
  if (!clinic) return;
  const date = req.query.date || todayIST();
  const tokens = await Token.find({ clinicId: clinic._id, date })
    .sort('tokenNumber')
    .populate('patientId', 'name phone');
  res.json(tokens);
});

// Live queue + estimated wait time
router.get('/:id/queue', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ msg: 'Clinic not found' });

    const date = todayIST();
    const current = await Token.findOne({
      clinicId: clinic._id, date, status: 'in-progress',
    });
    const waiting = await Token.find({
      clinicId: clinic._id, date, status: 'waiting',
    }).sort({ isEmergency: -1, tokenNumber: 1 });

    const queue = waiting.map((t, i) => ({
      _id: t._id,
      patientId: t.patientId,
      tokenNumber: t.tokenNumber,
      isEmergency: t.isEmergency,
      patientsAhead: i,
      estimatedWaitMin: (i + (current ? 1 : 0)) * clinic.avgConsultTime,
    }));

    res.json({
      clinic: clinic.name,
      nowServing: current ? current.tokenNumber : null,
      waitingCount: queue.length,
      isPaused: clinic.isPaused,
      pauseMessage: clinic.pauseMessage,
      resumeTime: clinic.resumeTime,
      queue,
    });
  } catch {
    res.status(400).json({ msg: 'Invalid clinic id' });
  }
});

// Pause / resume the queue (owner only)
router.patch('/:id/pause', protect, allow('staff', 'admin'), async (req, res) => {
  const clinic = await getOwnedClinic(req, res);
  if (!clinic) return;

  const { isPaused, pauseMessage, resumeTime } = req.body;
  clinic.isPaused = !!isPaused;
  clinic.pauseMessage = isPaused ? (pauseMessage || 'Doctor is on a short break') : '';
  clinic.resumeTime = isPaused ? (resumeTime || '') : '';
  await clinic.save();

  req.app.get('io').to(String(clinic._id)).emit('queue:update');
  res.json(clinic);
});

// Today's stats for the doctor
router.get('/:id/stats', protect, allow('staff', 'admin'), async (req, res) => {
  try {
    const date = todayIST();
    const count = (status) =>
      Token.countDocuments({
        clinicId: req.params.id, date, ...(status && { status }),
      });
    const [total, waiting, inProgress, done, skipped, cancelled] = await Promise.all([
      count(), count('waiting'), count('in-progress'),
      count('done'), count('skipped'), count('cancelled'),
    ]);
    res.json({ total, waiting, inProgress, done, skipped, cancelled });
  } catch {
    res.status(400).json({ msg: 'Invalid clinic id' });
  }
});

module.exports = router;