const { MessageFlags } = require('discord.js'); 
const handleRoleSelectMenu = require('../handlers/selectMenuHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        const payload = { content: '❌ There was an error while executing this command.', flags: MessageFlags.Ephemeral };
        if (interaction.deferred || interaction.replied) await interaction.editReply(payload);
        else await interaction.reply(payload);
      }
    } 
    
    // 2. Handle Dropdown Menu Selections
    else if (interaction.isStringSelectMenu()) {
      await handleRoleSelectMenu(interaction);
    }
    
    // 3. ⚡ NEW: Handle Autocomplete typing events
    else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }
    
  }
};