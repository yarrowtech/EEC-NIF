const jwt = require('jsonwebtoken');

const extractSchoolId = (req) => {
  const headerId = req.headers['x-school-id'] || req.headers['x-schoolid'];
  const queryId = req.query?.schoolId;
  const bodyId = req.body?.schoolId;
  return headerId || queryId || bodyId || null;
};

const extractCampusId = (req) => {
  const headerId = req.headers['x-campus-id'] || req.headers['x-campusid'];
  const queryId = req.query?.campusId;
  const bodyId = req.body?.campusId;
  return headerId || queryId || bodyId || null;
};

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const tokenSchoolId = decoded.schoolId || null;
    const tokenCampusId = decoded.campusId || null;
    const isSuperAdmin = !tokenSchoolId;
    const effectiveSchoolId = tokenSchoolId || (isSuperAdmin ? extractSchoolId(req) : null);
    const effectiveCampusId = tokenCampusId || (isSuperAdmin ? extractCampusId(req) : null);
    if (!effectiveCampusId) {
      return res.status(400).json({ error: 'campusId is required' });
    }
    req.admin = decoded;
    req.userType = 'Admin';
    req.isSuperAdmin = isSuperAdmin;
    req.schoolId = effectiveSchoolId;
    req.campusId = effectiveCampusId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = adminAuth;
