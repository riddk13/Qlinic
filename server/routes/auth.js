const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const makeToken = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ msg: 'Name, phone aur password zaruri hain' });
    if (await User.findOne({ phone }))
      return res.status(400).json({ msg: 'Yeh number pehle se registered hai' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, phone, password: hashed,
      role: role === 'staff' ? 'staff' : 'patient', // admin direct nahi banega
    });
    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ msg: 'Phone ya password galat hai' });
    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;