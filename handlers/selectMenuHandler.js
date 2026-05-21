const RoleOption = require('../models/RoleOption');

module.exports = async function handleRoleSelectMenu(interaction) {
  const selectedRoleIds = interaction.values;
  const member = interaction.member;
  const guildId = interaction.guildId;
  const category = interaction.customId.replace('_select', ''); // Extract category from customId

  try {
    const rolesInCategory = await RoleOption.find({ guildId, category });
    if (rolesInCategory.length === 0) {
      return interaction.reply({ content: '❌ No data found for this category.', ephemeral: true });
    }

    const validRoles = rolesInCategory.map(r => r.value);
    
    // Remove old roles that belong to this specific category
    const rolesToRemove = member.roles.cache.filter(role => validRoles.includes(role.id));
    await member.roles.remove(rolesToRemove);
    
    // Assign newly selected roles
    if (selectedRoleIds.length > 0) {
      await member.roles.add(selectedRoleIds);
    }

    await interaction.reply({ content: '✅ Roles successfully updated!', ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to assign roles. Check bot permissions hierarchy.', ephemeral: true });
  }
};