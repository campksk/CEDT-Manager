const { rolemenu } = require("../data/rolemenu");

module.exports = async function updateRoleMenu(channel, messageId, guildId) {
  const message = await channel.messages.fetch(messageId);
  const { embed, components } = await rolemenu(guildId); // เปลี่ยนมาใช้ await

  if (components.length === 0) {
    return channel.send({ content: "⚠️ ยังไม่มีการตั้งค่ายศใดๆ ในระบบ ไม่สามารถอัปเดตเมนูได้!" });
  }

  await message.edit({ embeds: [embed], components: components });
};