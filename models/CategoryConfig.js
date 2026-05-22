const mongoose = require('mongoose');

const categoryConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  allowMultiple: { type: Boolean, default: true } // Default is true (Multiple selections)
});

module.exports = mongoose.model('CategoryConfig', categoryConfigSchema);