const { MessageFlags } = require('discord.js'); // Add this import
const RoleOption = require('../models/RoleOption');

module.exports = async function handleRoleSelectMenu(interaction) {
  const selectedRoleIds = interaction.values;
  const member = interaction.member;
  const guildId = interaction.guildId;
  const category = interaction.customId.replace('_select', ''); 

  try {
    const rolesInCategory = await RoleOption.find({ guildId, category });
    if (rolesInCategory.length === 0) {
      // Update this line
      return interaction.reply({ content: '❌ No data found for this category.', flags: MessageFlags.Ephemeral });
    }

    const validRoles = rolesInCategory.map(r => r.value);
    
    const rolesToRemove = member.roles.cache.filter(role => validRoles.includes(role.id));
    await member.roles.remove(rolesToRemove);
    
    if (selectedRoleIds.length > 0) {
      await member.roles.add(selectedRoleIds);
    }

    // Update this line
    await interaction.reply({ content: '✅ Roles successfully updated!', flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error(err);
    // Update this line
    await interaction.reply({ content: '❌ Failed to assign roles. Check bot permissions hierarchy.', flags: MessageFlags.Ephemeral });
  }
};