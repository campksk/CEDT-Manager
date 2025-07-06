const { rolemenu } = require("../data/rolemenu");

module.exports = async function sendRoleSelectMenu(channel) {
  const { embed, guild_row, gender_row, interested_row, game_row, color_row } = rolemenu();

  await channel.send({
    embeds: [embed],
    components: [guild_row, gender_row, interested_row, game_row, color_row],
  });
};
