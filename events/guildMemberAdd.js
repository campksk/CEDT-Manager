const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder');
const WelcomeConfig = require('../models/WelcomeConfig'); // Use the new model

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Fetch data from the new collection
    const configData = await WelcomeConfig.findOne({ guildId: member.guild.id });
    
    // Priority: Database config -> .env fallback
    const channelId = configData?.channelId;
    if (!channelId) return; 

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    // Generate the embed based on server configuration
    const embed = buildWelcomeEmbed(member, configData?.embed);
    
    const payload = { embeds: [embed] };

    // Add plain text content outside the embed if configured
    if (configData?.message) {
      payload.content = configData.message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{server}/g, member.guild.name);
    }

    await channel.send(payload);
  }
};