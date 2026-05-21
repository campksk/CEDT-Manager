const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    console.log(`🗑️ บอทถูกเตะออก หรือเซิร์ฟเวอร์ถูกลบ: ${guild.name} (${guild.id})`);
    
    try {
      await Guild.deleteOne({ guildId: guild.id });
      await RoleOption.deleteMany({ guildId: guild.id });
      
      console.log(`✅ ล้างข้อมูลเซิร์ฟเวอร์ ${guild.id} ออกจากระบบอัตโนมัติสำเร็จ!`);
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการลบข้อมูลเซิร์ฟเวอร์ ${guild.id}:`, error);
    }
  }
};