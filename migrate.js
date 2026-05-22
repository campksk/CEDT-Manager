require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Guild = require('./models/Guild');
const RoleOption = require('./models/RoleOption'); 

const targetGuildId = 'GUILDID';

async function runMigration() {
  try {
    console.log('⏳ Registering roles from roleOptions.json...');
    const rawData = fs.readFileSync('./roleOptions.json', 'utf-8');
    const roleOptionsData = JSON.parse(rawData);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Guild.deleteOne({ guildId: targetGuildId });
    await RoleOption.deleteMany({ guildId: targetGuildId });
    console.log('🗑️ Cleared existing data for the target guild');

    await Guild.create({ guildId: targetGuildId });

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

    console.log(`🎉 Migration Success! ${documentsToInsert.length}`);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runMigration();