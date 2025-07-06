const { rolemenu } = require("../data/rolemenu");

module.exports = async function updateRoleMenu(channel, messageId) {
  const message = await channel.messages.fetch(messageId);
  const { embed, row1, row2, row3, row4, row5 } = rolemenu();

  await message.edit({
    embeds: [embed],
    components: [row1, row2, row3, row4, row5],
  });
};
