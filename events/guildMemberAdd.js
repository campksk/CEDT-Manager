const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return console.error('❌ ไม่พบช่องต้อนรับ');

    const embed = buildWelcomeEmbed(member);
    await channel.send({ embeds: [embed] });
  }
};