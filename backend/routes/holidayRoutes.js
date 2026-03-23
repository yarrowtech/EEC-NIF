const express = require('express');
const mongoose = require('mongoose');
const Holiday = require('../models/Holiday');
const adminAuth = require('../middleware/adminAuth');
const authTeacher = require('../middleware/authTeacher');
const authStudent = require('../middleware/authStudent');

const router = express.Router();

const normalizeHolidayDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const resolveAdminScope = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || null;
  if (!schoolId || !mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Valid schoolId is required' });
    return null;
  }
  return { schoolId, campusId: req.campusId || null };
};

const toPublicHoliday = (item) => ({
  _id: item._id,
  name: item.name,
  date: item.date,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const buildDateFilter = (query) => {
  const from = query?.from ? new Date(query.from) : null;
  const to = query?.to ? new Date(query.to) : null;
  const filter = {};
  if (from && !Number.isNaN(from.getTime())) {
    filter.$gte = from;
  }
  if (to && !Number.isNaN(to.getTime())) {
    filter.$lte = to;
  }
  return Object.keys(filter).length ? filter : null;
};

router.post('/', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const name = String(req.body?.name || '').trim();
    const date = normalizeHolidayDate(req.body?.date);

    if (!name) {
      return res.status(400).json({ error: 'Holiday name is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Valid holiday date is required' });
    }

    const created = await Holiday.create({
      schoolId: scope.schoolId,
      campusId: scope.campusId,
      name,
      date,
      createdBy: req.admin?.id || null,
    });

    return res.status(201).json(toPublicHoliday(created));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Holiday already exists for this date' });
    }
    return res.status(400).json({ error: err.message || 'Unable to create holiday' });
  }
});

router.get('/admin', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const dateFilter = buildDateFilter(req.query);
    const filter = {
      schoolId: scope.schoolId,
      ...(scope.campusId ? { campusId: scope.campusId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };
    const items = await Holiday.find(filter).sort({ date: 1, createdAt: -1 }).lean();
    return res.json(items.map(toPublicHoliday));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to load holidays' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid holiday id' });
    }
    const deleted = await Holiday.findOneAndDelete({
      _id: id,
      schoolId: scope.schoolId,
      ...(scope.campusId ? { campusId: scope.campusId } : {}),
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    return res.json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to delete holiday' });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid holiday id' });
    }

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
      const name = String(req.body?.name || '').trim();
      if (!name) {
        return res.status(400).json({ error: 'Holiday name is required' });
      }
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'date')) {
      const date = normalizeHolidayDate(req.body?.date);
      if (!date) {
        return res.status(400).json({ error: 'Valid holiday date is required' });
      }
      updates.date = date;
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = await Holiday.findOneAndUpdate(
      {
        _id: id,
        schoolId: scope.schoolId,
        ...(scope.campusId ? { campusId: scope.campusId } : {}),
      },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    return res.json(toPublicHoliday(updated));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Holiday already exists for this date' });
    }
    return res.status(500).json({ error: err.message || 'Unable to update holiday' });
  }
});

router.get('/teacher', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId || null;
    const campusId = req.campusId || null;
    if (!schoolId || !mongoose.isValidObjectId(schoolId)) {
      return res.status(400).json({ error: 'Valid schoolId is required' });
    }
    const dateFilter = buildDateFilter(req.query);
    const filter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };
    const items = await Holiday.find(filter).sort({ date: 1, createdAt: -1 }).lean();
    return res.json(items.map(toPublicHoliday));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to load holidays' });
  }
});

router.get('/student', authStudent, async (req, res) => {
  try {
    const schoolId = req.schoolId || null;
    const campusId = req.campusId || null;
    if (!schoolId || !mongoose.isValidObjectId(schoolId)) {
      return res.status(400).json({ error: 'Valid schoolId is required' });
    }
    const dateFilter = buildDateFilter(req.query);
    const filter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    };
    const items = await Holiday.find(filter).sort({ date: 1, createdAt: -1 }).lean();
    return res.json(items.map(toPublicHoliday));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to load holidays' });
  }
});

module.exports = router;
