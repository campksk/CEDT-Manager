const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder');
const Guild = require('../models/Guild');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    
    // Priority: DB Config -> .env fallback -> Do nothing
    const channelId = guildData?.welcomeChannelId || process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return; 

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const customMessage = guildData?.welcomeMessage || 'Welcome {user} to {server}! 🎉';
    const embed = buildWelcomeEmbed(member, customMessage);

    await channel.send({ embeds: [embed] });
  }
};