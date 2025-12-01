const Wellbeing = require('../models/Wellbeing');
const StudentUser = require('../models/StudentUser');

exports.getWellbeing = async (req, res) => {
  const { studentId } = req.params;

  try {
    let wellbeing = await Wellbeing.findOne({ student: studentId });

    if (!wellbeing) {
      // If no wellbeing record exists, create a default one
      const student = await StudentUser.findById(studentId);
      if (!student) {
        return res.status(404).json({ msg: 'Student not found' });
      }
      wellbeing = new Wellbeing({
        student: studentId,
      });
      await wellbeing.save();
    }

    res.json(wellbeing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateWellbeing = async (req, res) => {
  const { studentId } = req.params;
  const {
    mood,
    socialEngagement,
    academicStress,
    behaviorChanges,
    notes,
  } = req.body;

  try {
    let student = await StudentUser.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    let wellbeing = await Wellbeing.findOne({ student: studentId });

    if (!wellbeing) {
      wellbeing = new Wellbeing({
        student: studentId,
      });
    }

    wellbeing.mood = mood || wellbeing.mood;
    wellbeing.socialEngagement = socialEngagement || wellbeing.socialEngagement;
    wellbeing.academicStress = academicStress || wellbeing.academicStress;
    wellbeing.behaviorChanges = behaviorChanges || wellbeing.behaviorChanges;
    wellbeing.notes = notes || wellbeing.notes;
    wellbeing.lastAssessment = Date.now();

    await wellbeing.save();

    res.json(wellbeing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};