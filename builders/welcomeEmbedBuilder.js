const { EmbedBuilder } = require('discord.js');

module.exports = function buildWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setColor('#FF9B45')
    .setTitle(`🎉 ยินดีต้อนรับสู่ ${member.guild.name}!`)
    .setDescription(`สวัสดี <@${member.id}> ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์ของเรา!\nขอให้สนุกกับการพูดคุยนะครับ! 💬`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `ตอนนี้เรามีสมาชิกทั้งหมด ${member.guild.memberCount} คนแล้ว!` })
    .setTimestamp();
};