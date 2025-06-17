const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

function rolemenu() {
  const { roleOptions, getMaxRole } = require("../data/roleOptions");

  const embed = new EmbedBuilder()
    .setTitle("🎭 รับยศด้วยตัวคุณเอง!")
    .setDescription("เลือกรับยศตามหมวดหมู่ด้านล่าง")
    .setColor("#FF9B45");

  const genderSelect = new StringSelectMenuBuilder()
    .setCustomId("gender_select")
    .setPlaceholder("เลือกเพศของคุณ")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(roleOptions.gender);

  const colorSelect = new StringSelectMenuBuilder()
    .setCustomId("color_select")
    .setPlaceholder("เลือกสีประจำตัว")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(roleOptions.color);

  const gameSelect = new StringSelectMenuBuilder()
    .setCustomId("game_select")
    .setPlaceholder("เลือกเกมที่คุณเล่น")
    .setMinValues(0)
    .setMaxValues(getMaxRole("game_select"))
    .addOptions(roleOptions.game);

  const interestedSelect = new StringSelectMenuBuilder()
    .setCustomId("interested_select")
    .setPlaceholder("เลือกความสนใจ")
    .setMinValues(0)
    .setMaxValues(getMaxRole("interested_select"))
    .addOptions(roleOptions.interested);

  const row1 = new ActionRowBuilder().addComponents(genderSelect);
  const row2 = new ActionRowBuilder().addComponents(colorSelect);
  const row3 = new ActionRowBuilder().addComponents(gameSelect);
  const row4 = new ActionRowBuilder().addComponents(interestedSelect);

  return { embed, row1, row2, row3, row4 };
}

module.exports = {
  rolemenu,
};
