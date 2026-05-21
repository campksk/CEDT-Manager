const { rolemenu } = require("../data/rolemenu");

module.exports = async function sendRoleSelectMenu(channel, guildId) {
  const { embed, components } = await rolemenu(guildId); // เปลี่ยนมาใช้ await

  if (components.length === 0) {
    return channel.send({ content: "⚠️ ยังไม่มีการตั้งค่ายศใดๆ ในระบบ กรุณาเพิ่มยศก่อน!" });
  }

  await channel.send({ embeds: [embed], components: components });
};