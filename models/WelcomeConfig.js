const mongoose = require('mongoose');

const welcomeConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  channelId: { type: String, default: null },
  message: { type: String, default: null },
  embed: {
    title: { type: String, default: '🎉 Welcome!' },
    description: { type: String, default: 'Welcome {user} to {server}! 🎉' },
    color: { type: String, default: '#FF9B45' },
    thumbnail: { type: Boolean, default: true }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WelcomeConfig', welcomeConfigSchema);