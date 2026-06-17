const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    apiKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
