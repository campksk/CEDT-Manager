const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');
const WelcomeConfig = require('../models/WelcomeConfig');
const CategoryConfig = require('../models/CategoryConfig'); // Import the config model

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    console.log(`🗑️ Bot removed from server: ${guild.name} (${guild.id})`);
    
    try {
      // Clean up all collections related to this guild
      await Guild.deleteOne({ guildId: guild.id });
      await RoleOption.deleteMany({ guildId: guild.id });
      await WelcomeConfig.deleteOne({ guildId: guild.id });
      await CategoryConfig.deleteMany({ guildId: guild.id }); // Clean up category configs
      
      console.log(`✅ Successfully wiped data for ${guild.id}`);
    } catch (error) {
      console.error(`❌ Error deleting data for ${guild.id}:`, error);
    }
  }
};