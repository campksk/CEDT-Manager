const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder');
const WelcomeConfig = require('../models/WelcomeConfig'); 
const appCache = require('../utils/cache');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildId = member.guild.id;
    const cacheKey = `welcome_${guildId}`;

    let configData = appCache.get(cacheKey);

    if (!configData) {
      // Add .lean() to return a plain JavaScript object instead of a Mongoose Document
      configData = await WelcomeConfig.findOne({ guildId }).lean();
      
      if (configData) {
        appCache.set(cacheKey, configData);
      }
    }
    
    const channelId = configData?.channelId;
    if (!channelId) return; 

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const embed = buildWelcomeEmbed(member, configData?.embed);
    const payload = { embeds: [embed] };

    if (configData?.message) {
      payload.content = configData.message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{server}/g, member.guild.name);
    }

    await channel.send(payload);
  }
};