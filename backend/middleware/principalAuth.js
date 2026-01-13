const jwt = require('jsonwebtoken');

const principalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'principal') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.principal = decoded;
    req.userType = 'Principal';
    req.schoolId = decoded.schoolId || null;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = principalAuth;
