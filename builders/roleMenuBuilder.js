const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RoleOption = require('../models/RoleOption');

async function buildRoleMenuPayload(guildId) {
  // ดึงข้อมูลยศทั้งหมดของเซิร์ฟเวอร์นี้
  const allRoles = await RoleOption.find({ guildId });

  // ฟังก์ชันแยกหมวดหมู่
  const getRoles = (category) => allRoles.filter(role => role.category === category);

  const roleOptions = {
    guild: getRoles('guild'),
    gender: getRoles('gender'),
    interested: getRoles('interested'),
    game: getRoles('game'),
    color: getRoles('color')
  };

  const embed = new EmbedBuilder()
    .setTitle("🎭 รับยศด้วยตัวคุณเอง!")
    .setDescription("เลือกรับยศตามหมวดหมู่ด้านล่าง")
    .setColor("#FF9B45");

  const components = [];

  const addMenu = (id, placeholder, maxValues, options) => {
    if (options && options.length > 0) {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(placeholder)
        .setMinValues(0)
        .setMaxValues(maxValues || 1)
        .addOptions(options.map(opt => ({
           label: opt.label,
           value: opt.value,
           description: opt.description || undefined,
           emoji: opt.emoji
        })));
      components.push(new ActionRowBuilder().addComponents(selectMenu));
    }
  };

  addMenu("guild_select", "เลือกกิลล์ที่อยู่", 1, roleOptions.guild);
  addMenu("gender_select", "เลือกเพศของคุณ", 1, roleOptions.gender);
  addMenu("interested_select", "เลือกความสนใจ", roleOptions.interested.length, roleOptions.interested);
  addMenu("game_select", "เลือกเกมที่คุณเล่น", roleOptions.game.length, roleOptions.game);
  addMenu("color_select", "เลือกสีประจำตัว", 1, roleOptions.color);

  return { embed, components };
}

module.exports = { buildRoleMenuPayload };