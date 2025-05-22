const { EmbedBuilder } = require('discord.js');

module.exports = async function sendWelcomeEmbed(member) {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  const channel = member.guild.channels.cache.get(channelId);

  if (!channel) {
    console.error('❌ ไม่พบช่องต้อนรับ');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#FF9B45')
    .setTitle(`🎉 ยินดีต้อนรับสู่ ${member.guild.name}!`)
    .setDescription(`สวัสดี <@${member.id}> ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์ของเรา!\nขอให้สนุกกับการพูดคุยนะครับ! 💬`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `ตอนนี้เรามีสมาชิกทั้งหมด ${member.guild.memberCount} คนแล้ว!` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
};
