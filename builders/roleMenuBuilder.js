const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RoleOption = require('../models/RoleOption');

async function buildRoleMenuPayload(guildId) {
  const allRoles = await RoleOption.find({ guildId });

  const embed = new EmbedBuilder()
    .setTitle("🎭 Get Your Roles!")
    .setDescription("Select your roles from the dropdown menus below.")
    .setColor("#FF9B45");

  const components = [];

  // Dynamically group roles by their category
  const rolesByCategory = allRoles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {});

  // Discord limits messages to 5 ActionRows (5 categories max per message)
  const categories = Object.keys(rolesByCategory).slice(0, 5);

  for (const category of categories) {
    const roles = rolesByCategory[category];
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`${category}_select`)
      .setPlaceholder(`Select your ${category}`)
      .setMinValues(0)
      .setMaxValues(roles.length) // Allow selecting multiple roles in the category
      .addOptions(roles.map(opt => ({
         label: opt.label,
         value: opt.value,
         description: opt.description || undefined,
         emoji: opt.emoji || undefined
      })));

    components.push(new ActionRowBuilder().addComponents(selectMenu));
  }

  return { embed, components };
}

module.exports = { buildRoleMenuPayload };