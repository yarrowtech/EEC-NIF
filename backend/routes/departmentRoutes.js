const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const Department = require('../models/Department');

const router = express.Router();

const resolveAdminScope = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || null;
  if (!schoolId || !mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Valid schoolId is required' });
    return null;
  }
  return { schoolId, campusId: req.campusId || null };
};

const buildScopeFilter = ({ schoolId, campusId }) => ({
  schoolId,
  ...(campusId ? { campusId } : {}),
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const items = await Department.find(buildScopeFilter(scope))
      .sort({ name: 1 })
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load departments' });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const created = await Department.create({
      ...buildScopeFilter(scope),
      name,
      description,
      createdBy: req.admin?.id || null,
    });
    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Department already exists' });
    }
    res.status(400).json({ error: err.message || 'Unable to create department' });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid department id' });

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
      const name = String(req.body?.name || '').trim();
      if (!name) return res.status(400).json({ error: 'Department name is required' });
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'description')) {
      updates.description = String(req.body?.description || '').trim();
    }

    const updated = await Department.findOneAndUpdate(
      { _id: id, ...buildScopeFilter(scope) },
      updates,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Department not found' });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Department already exists' });
    }
    res.status(400).json({ error: err.message || 'Unable to update department' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const scope = resolveAdminScope(req, res);
    if (!scope) return;
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid department id' });

    const deleted = await Department.findOneAndDelete({ _id: id, ...buildScopeFilter(scope) });
    if (!deleted) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to delete department' });
  }
});

module.exports = router;
