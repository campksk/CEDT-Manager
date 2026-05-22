const { MessageFlags } = require('discord.js');
const RoleOption = require('../models/RoleOption');
const appCache = require('../utils/cache'); 

module.exports = async function handleRoleSelectMenu(interaction) {
  // Tell Discord we are processing to prevent the 3-second timeout crash
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const selectedRoleIds = interaction.values;
  const member = interaction.member;
  const guildId = interaction.guildId;
  const category = interaction.customId.replace('_select', ''); 

  try {
    const cacheKey = `roles_${guildId}_${category}`;
    let rolesInCategory = appCache.get(cacheKey);

    if (!rolesInCategory) {
      rolesInCategory = await RoleOption.find({ guildId, category }).lean();
      if (rolesInCategory.length > 0) appCache.set(cacheKey, rolesInCategory);
    }

    if (rolesInCategory.length === 0) {
      return interaction.editReply({ content: '❌ No data found for this category.' });
    }

    // Get all valid role IDs for this specific category from the database
    const validRoles = rolesInCategory.map(r => r.value);
    
    // --- BACK TO BASICS: CLEAR AND APPLY ---
    
    // 1. Find all roles the user currently has that belong to this category
    const rolesToRemove = member.roles.cache.filter(role => validRoles.includes(role.id));
    
    // 2. Remove all of those roles completely (Wipe the slate clean)
    if (rolesToRemove.size > 0) {
      await member.roles.remove(rolesToRemove);
    }
    
    // 3. Add the newly selected roles from the dropdown menu
    if (selectedRoleIds.length > 0) {
      await member.roles.add(selectedRoleIds);
    }

    // ---------------------------------------

    await interaction.editReply({ content: '✅ Roles successfully updated!' });
  } catch (err) {
    console.error(err);
    await interaction.editReply({ content: '❌ Failed to assign roles. Check bot permissions hierarchy.' });
  }
};