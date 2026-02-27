const mongoose = require('mongoose');

const demoMetadataSchema = new mongoose.Schema({
  type: { type: String, required: true, default: 'demo_credentials' },
  role: { type: String, required: true },
  email: { type: String, required: true },
  password_hint: { type: String, required: true },
  note: { type: String, default: 'For end-to-end demo testing only' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

demoMetadataSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model('DemoMetadata', demoMetadataSchema);

