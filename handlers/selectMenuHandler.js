const RoleOption = require('../models/RoleOption');

module.exports = async function handleRoleSelectMenu(interaction) {
  const selectedRoleIds = interaction.values;
  const member = interaction.member;
  const guildId = interaction.guildId;
  const category = interaction.customId.replace('_select', '');

  try {
    // หาข้อมูลยศในหมวดหมู่นี้จาก Database
    const rolesInCategory = await RoleOption.find({ guildId, category });
    
    if (rolesInCategory.length === 0) {
      return interaction.reply({ content: '❌ ไม่พบข้อมูลยศของเซิร์ฟเวอร์นี้', ephemeral: true });
    }

    const validRoles = rolesInCategory.map(r => r.value);
    
    // ลบยศเก่าออกเฉพาะในหมวดหมู่นั้นๆ
    const rolesToRemove = member.roles.cache.filter(role => validRoles.includes(role.id));
    await member.roles.remove(rolesToRemove);
    
    // มอบยศใหม่ที่เพิ่งเลือก
    if (selectedRoleIds.length > 0) {
      await member.roles.add(selectedRoleIds);
    }

    await interaction.reply({ content: '✅ ตั้งค่ายศเรียบร้อยแล้ว!', ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ เกิดข้อผิดพลาดในการให้ยศ โปรดตรวจสอบสิทธิ์ของบอท', ephemeral: true });
  }
};