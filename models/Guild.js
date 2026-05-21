const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  roleMenuChannelId: { type: String, default: null },
  roleMenuMessageId: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guild', guildSchema);