const mongoose = require('mongoose');

const supportSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    phoneNumber: { type: String, default: '+91 90420 56789' },
    email: { type: String, default: 'support@eecschools.com' },
    availableDays: { type: String, default: 'Mon - Fri' },
    availableTime: { type: String, default: '8 AM - 6 PM IST' },
    onCall24x7: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportSetting', supportSettingSchema);
