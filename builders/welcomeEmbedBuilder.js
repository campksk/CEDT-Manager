const { EmbedBuilder } = require('discord.js');

module.exports = function buildWelcomeEmbed(member, embedConfig) {
  const titleTemplate = embedConfig?.title || '🎉 Welcome!';
  const descriptionTemplate = embedConfig?.description || 'Welcome {user} to {server}! 🎉';
  const color = embedConfig?.color || '#FF9B45';

  const title = titleTemplate
    .replace(/{user}/g, member.user.username)
    .replace(/{server}/g, member.guild.name);

  const description = descriptionTemplate
    .replace(/{user}/g, `<@${member.id}>`)
    .replace(/{server}/g, member.guild.name);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `We now have ${member.guild.memberCount} members!` })
    .setTimestamp();

  if (embedConfig?.thumbnail !== false) {
    embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
  }

  if (embedConfig?.image) {
    embed.setImage(embedConfig.image);
  }

  return embed;
};