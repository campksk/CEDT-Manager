const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');
const WelcomeConfig = require('../models/WelcomeConfig');
const CategoryConfig = require('../models/CategoryConfig'); 
const appCache = require('../utils/cache'); // Import Cache

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    const guildId = guild.id;
    console.log(`🗑️ Bot removed from server: ${guild.name} (${guildId})`);
    
    try {
      // 1. Clean up Database
      await Guild.deleteOne({ guildId });
      await RoleOption.deleteMany({ guildId });
      await WelcomeConfig.deleteOne({ guildId });
      await CategoryConfig.deleteMany({ guildId });
      
      // 2. 🔴 Clean up Cache to free up memory
      appCache.del(`welcome_${guildId}`);
      appCache.del(`allRoles_${guildId}`);
      appCache.del(`categoryConfigs_${guildId}`);
      
      console.log(`✅ Successfully wiped data and cache for ${guildId}`);
    } catch (error) {
      console.error(`❌ Error deleting data for ${guildId}:`, error);
    }
  }
};