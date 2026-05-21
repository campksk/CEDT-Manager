// migrate.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Guild = require('./models/Guild'); // ดึงมาใช้คู่กัน
const RoleOption = require('./models/RoleOption'); 

const targetGuildId = 'GUILDID';

async function runMigration() {
  try {
    console.log('⏳ กำลังอ่านข้อมูลจากไฟล์ roleOptions.json...');
    const rawData = fs.readFileSync('./roleOptions.json', 'utf-8');
    const roleOptionsData = JSON.parse(rawData);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. ล้างข้อมูลเก่าทั้งหมดของกิลล์นี้เพื่อป้องกันข้อมูลซ้ำซ้อน
    await Guild.deleteOne({ guildId: targetGuildId });
    await RoleOption.deleteMany({ guildId: targetGuildId });
    console.log('🗑️ ล้างข้อมูลเก่าของเซิร์ฟเวอร์นี้เรียบร้อย...');

    // 2. สร้างข้อมูลเซิร์ฟเวอร์ในคอลเลกชัน Guild
    await Guild.create({ guildId: targetGuildId });

    // 3. กระจายข้อมูล Role แตกย่อยเป็น Document ชิ้นๆ
    const documentsToInsert = [];
    for (const [category, roles] of Object.entries(roleOptionsData)) {
      for (const role of roles) {
        documentsToInsert.push({
          guildId: targetGuildId,
          category: category, 
          label: role.label,
          value: role.value,
          description: role.description || undefined,
          emoji: role.emoji
        });
      }
    }

    if (documentsToInsert.length > 0) {
      await RoleOption.insertMany(documentsToInsert);
    }

    console.log(`🎉 Migration Success! ลงทะเบียน Guild และสร้าง Document แยกยศทั้งหมด ${documentsToInsert.length} รายการเสร็จสิ้น`);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runMigration();