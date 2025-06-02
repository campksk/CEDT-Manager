const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { roleOptions } = require('../data/roleOptions');

module.exports = async function updateRoleMenu(channel, messageId) {
  const message = await channel.messages.fetch(messageId);

  const embed = new EmbedBuilder()
    .setTitle('🎭 รับยศด้วยตัวคุณเอง!')
    .setDescription('เลือกรับยศตามหมวดหมู่ด้านล่าง')
    .setColor('#FF9B45');

  const genderSelect = new StringSelectMenuBuilder()
    .setCustomId('gender_select')
    .setPlaceholder('เลือกเพศของคุณ')
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(roleOptions.gender);

  const colorSelect = new StringSelectMenuBuilder()
    .setCustomId('color_select')
    .setPlaceholder('เลือกสีประจำตัว')
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(roleOptions.color);

  const gameSelect = new StringSelectMenuBuilder()
    .setCustomId('game_select')
    .setPlaceholder('เลือกเกมที่คุณเล่น')
    .setMinValues(0)
    .setMaxValues(6)
    .addOptions(roleOptions.game);

  const interestedSelect = new StringSelectMenuBuilder()
    .setCustomId('interested_select')
    .setPlaceholder('เลือกความสนใจ')
    .setMinValues(0)
    .setMaxValues(11)
    .addOptions(roleOptions.interested);

  const row1 = new ActionRowBuilder().addComponents(genderSelect);
  const row2 = new ActionRowBuilder().addComponents(colorSelect);
  const row3 = new ActionRowBuilder().addComponents(gameSelect);
  const row4 = new ActionRowBuilder().addComponents(interestedSelect);

  await message.edit({
    embeds: [embed],
    components: [row1, row2, row3, row4],
  });
};
