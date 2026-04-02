const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    roomKey: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.index(
  { schoolId: 1, campusId: 1, floorId: 1, roomKey: 1 },
  { unique: true, name: 'uniq_room_per_floor' }
);

module.exports = mongoose.model('Room', roomSchema);
