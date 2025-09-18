const jwt = require('jsonwebtoken');

// Accepts any valid user token (student/teacher/parent). Sets req.user and req.userType.
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userType = decoded.userType || 'unknown';
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

