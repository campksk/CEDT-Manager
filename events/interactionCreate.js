const handleRoleSelectMenu = require('../handlers/selectMenuHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        const replyOptions = { content: '❌ เกิดข้อผิดพลาดในการเรียกคำสั่งนี้', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(replyOptions);
        } else {
          await interaction.reply(replyOptions);
        }
      }
    } 
    else if (interaction.isStringSelectMenu()) {
      await handleRoleSelectMenu(interaction);
    }
  }
};