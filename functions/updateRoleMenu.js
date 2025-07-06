const { rolemenu } = require("../data/rolemenu");

module.exports = async function updateRoleMenu(channel, messageId) {
  const message = await channel.messages.fetch(messageId);
  const { embed, guild_row, gender_row, interested_row, game_row, color_row } = rolemenu();

  await message.edit({
    embeds: [embed],
    components: [guild_row, gender_row, interested_row, game_row, color_row],
  });
};
