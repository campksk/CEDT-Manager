const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    console.log(`🗑️ Bot removed from server: ${guild.name} (${guild.id})`);
    try {
      await Guild.deleteOne({ guildId: guild.id });
      await RoleOption.deleteMany({ guildId: guild.id });
      console.log(`✅ Successfully wiped data for ${guild.id}`);
    } catch (error) {
      console.error(`❌ Error deleting data for ${guild.id}:`, error);
    }
  }
};