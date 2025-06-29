const mongoose = require('mongoose');

const BurnEntrySchema = new mongoose.Schema({
  activityText: {
    type: String,
    required: true,
  },
  burn: {
    calories: Number,
    duration: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BurnEntry', BurnEntrySchema);
