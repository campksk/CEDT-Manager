const { rolemenu } = require("../data/rolemenu");

module.exports = async function sendRoleSelectMenu(channel) {
  const { embed, row1, row2, row3, row4 } = rolemenu();

  await channel.send({
    embeds: [embed],
    components: [row1, row2, row3, row4],
  });
};
