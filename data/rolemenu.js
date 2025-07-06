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

  const guildSelect = new StringSelectMenuBuilder()
    .setCustomId("guild_select")
    .setPlaceholder("เลือกกิลล์ที่อยู่")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(roleOptions.guild)

  const guild_row = new ActionRowBuilder().addComponents(guildSelect);
  const gender_row = new ActionRowBuilder().addComponents(genderSelect);
  const interested_row = new ActionRowBuilder().addComponents(interestedSelect);
  const game_row = new ActionRowBuilder().addComponents(gameSelect);
  const color_row = new ActionRowBuilder().addComponents(colorSelect);

  return { embed, guild_row, gender_row, interested_row, game_row, color_row };
}

module.exports = {
  rolemenu,
};
