const mongoose = require('mongoose');

const roleOptionSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  description: { type: String },
  emoji: { type: String }
});

module.exports = mongoose.model('RoleOption', roleOptionSchema);