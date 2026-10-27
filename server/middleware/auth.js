const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: 'Login zaruri hai' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token invalid hai' });
  }
};

exports.allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ msg: 'Permission nahi hai' });