const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RoleOption = require('../models/RoleOption');
const CategoryConfig = require('../models/CategoryConfig'); 
const appCache = require('../utils/cache'); 

async function buildRoleMenuPayload(guildId) {
  let allRoles = appCache.get(`allRoles_${guildId}`);
  let categoryConfigs = appCache.get(`categoryConfigs_${guildId}`);

  if (!allRoles || !categoryConfigs) {
    const [fetchedRoles, fetchedConfigs] = await Promise.all([
      // Add .lean() to both queries
      allRoles ? Promise.resolve(allRoles) : RoleOption.find({ guildId }).lean(),
      categoryConfigs ? Promise.resolve(categoryConfigs) : CategoryConfig.find({ guildId }).lean()
    ]);
    
    allRoles = fetchedRoles;
    categoryConfigs = fetchedConfigs;

    appCache.set(`allRoles_${guildId}`, allRoles);
    appCache.set(`categoryConfigs_${guildId}`, categoryConfigs);
  }

  const embed = new EmbedBuilder()
    .setTitle("🎭 Get Your Roles!")
    .setDescription("Select your roles from the dropdown menus below.")
    .setColor("#FF9B45");

  const components = [];

  const rolesByCategory = allRoles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {});

  const categories = Object.keys(rolesByCategory).slice(0, 5);

  for (const category of categories) {
    const roles = rolesByCategory[category];
    
    const config = categoryConfigs.find(c => c.category === category);
    const isMultiple = config ? config.allowMultiple : true; 
    
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