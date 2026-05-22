const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RoleOption = require('../models/RoleOption');
const CategoryConfig = require('../models/CategoryConfig'); 

async function buildRoleMenuPayload(guildId) {
  // Fetch both roles and category configurations concurrently for speed
  const [allRoles, categoryConfigs] = await Promise.all([
    RoleOption.find({ guildId }),
    CategoryConfig.find({ guildId })
  ]);

  const embed = new EmbedBuilder()
    .setTitle("🎭 Get Your Roles!")
    .setDescription("Select your roles from the dropdown menus below.")
    .setColor("#FF9B45");

  const components = [];

  // Group roles by category
  const rolesByCategory = allRoles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {});

  // Discord limits messages to 5 ActionRows
  const categories = Object.keys(rolesByCategory).slice(0, 5);

  for (const category of categories) {
    const roles = rolesByCategory[category];
    
    // Find the configuration for this specific category (Default to multiple if not found)
    const config = categoryConfigs.find(c => c.category === category);
    const isMultiple = config ? config.allowMultiple : true; 
    
    // Set max selection based on the configuration
    const maxSelections = isMultiple ? roles.length : 1;

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`${category}_select`)
      .setPlaceholder(`Select your ${category}`)
      .setMinValues(0)
      .setMaxValues(maxSelections) 
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