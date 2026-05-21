const { EmbedBuilder } = require('discord.js');

module.exports = function buildWelcomeEmbed(member, customMessage) {
  // Replace placeholders with actual user pings and server names
  const description = customMessage
    .replace(/{user}/g, `<@${member.id}>`)
    .replace(/{server}/g, member.guild.name);

  return new EmbedBuilder()
    .setColor('#FF9B45')
    .setTitle(`🎉 Welcome!`)
    .setDescription(description)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `We now have ${member.guild.memberCount} members!` })
    .setTimestamp();
};