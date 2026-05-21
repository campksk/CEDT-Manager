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
        const payload = { content: '❌ There was an error while executing this command.', ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.editReply(payload);
        else await interaction.reply(payload);
      }
    } 
    else if (interaction.isStringSelectMenu()) {
      await handleRoleSelectMenu(interaction);
    }
  }
};