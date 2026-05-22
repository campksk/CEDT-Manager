const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { buildRoleMenuPayload } = require('../builders/roleMenuBuilder');
const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');
const CategoryConfig = require('../models/CategoryConfig'); 
const appCache = require('../utils/cache'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('📋 Manage the role selection menu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('send').setDescription('Send a new role menu'))
    .addSubcommand(sub => sub.setName('update').setDescription('Update the active role menu automatically'))
    
    // Subcommand: Mode
    .addSubcommand(sub => sub.setName('mode')
        .setDescription('Set whether a category allows single or multiple selections')
        .addStringOption(opt => opt.setName('category')
            .setDescription('Category name (e.g., gender, game)')
            .setRequired(true)
            .setAutocomplete(true) // ⚡ ENABLE AUTOCOMPLETE HERE
        )
        .addStringOption(opt => opt.setName('selection_type')
            .setDescription('Allow users to select one or multiple roles?')
            .setRequired(true)
            .addChoices(
                { name: 'Single Selection (Only 1 Role)', value: 'single' },
                { name: 'Multiple Selections (Many Roles)', value: 'multiple' }
            ))
    )
    
    // Subcommand: Add
    .addSubcommand(sub => sub.setName('add').setDescription('Add a new role to the menu')
        .addStringOption(opt => opt.setName('category')
            .setDescription('Category name')
            .setRequired(true)
            .setAutocomplete(true) // ⚡ ENABLE AUTOCOMPLETE HERE TOO
        )
        .addRoleOption(opt => opt.setName('role').setDescription('The role to assign').setRequired(true))
        .addStringOption(opt => opt.setName('label').setDescription('Display label').setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji for the option').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('Optional description').setRequired(false))
    ),

  // ⚡ NEW: Autocomplete Logic
  async autocomplete(interaction) {
    // Get what the user has typed so far
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const guildId = interaction.guildId;

    try {
      // Fetch roles from cache for lightning-fast autocomplete, or DB if not cached
      let allRoles = appCache.get(`allRoles_${guildId}`);
      if (!allRoles) {
        allRoles = await RoleOption.find({ guildId }).lean();
      }

      // Extract unique categories using Set
      const uniqueCategories = [...new Set(allRoles.map(r => r.category))];

      // Filter categories that match what the user is typing
      const filtered = uniqueCategories
        .filter(choice => choice.toLowerCase().includes(focusedValue))
        .slice(0, 25); // Discord allows a max of 25 choices

      // Send the matching choices back to the user's Discord client
      await interaction.respond(
        filtered.map(choice => ({ name: choice, value: choice }))
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  },

  // Main Command Execution
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (sub === 'send' || sub === 'update') {
      const { embed, components } = await buildRoleMenuPayload(guildId);
      
      if (components.length === 0) {
        return interaction.editReply({ content: "⚠️ No roles configured yet. Use `/rolemenu add` first!" });
      }

      if (sub === 'send') {
        const sentMessage = await interaction.channel.send({ embeds: [embed], components });
        
        await Guild.findOneAndUpdate(
          { guildId }, 
          { guildId, roleMenuChannelId: interaction.channel.id, roleMenuMessageId: sentMessage.id }, 
          { upsert: true }
        );
        
        await interaction.editReply({ content: '✅ Role menu sent and registered as the active menu!' });
      
      } else if (sub === 'update') {
        const guildData = await Guild.findOne({ guildId });
        if (!guildData || !guildData.roleMenuMessageId) {
          return interaction.editReply({ content: '❌ No active role menu found. Please use `/rolemenu send` first.' });
        }

        try {
          const targetChannel = await interaction.client.channels.fetch(guildData.roleMenuChannelId);
          const targetMessage = await targetChannel.messages.fetch(guildData.roleMenuMessageId);
          await targetMessage.edit({ embeds: [embed], components });
          await interaction.editReply({ content: '🔄 Role menu updated automatically!' });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: '❌ Could not find the old menu message. Please send a new one.' });
        }
      }
    }

    if (sub === 'add') {
       const category = interaction.options.getString('category').toLowerCase();
       const role = interaction.options.getRole('role');
       const label = interaction.options.getString('label');
       const emoji = interaction.options.getString('emoji');
       const description = interaction.options.getString('description');

       try {
         const newRole = new RoleOption({ guildId, category, label, value: role.id, emoji });
         if (description) newRole.description = description;
         await newRole.save();

         appCache.del(`allRoles_${guildId}`); 
         appCache.del(`roles_${guildId}_${category}`);

         await interaction.editReply({ content: `✅ Added \`${label}\` to \`${category}\`. Run \`/rolemenu update\` to refresh.` });
       } catch(err) {
         await interaction.editReply({ content: '❌ Database error occurred.' });
       }
    }

    if (sub === 'mode') {
        const category = interaction.options.getString('category').toLowerCase();
        const selectionType = interaction.options.getString('selection_type');
        const allowMultiple = selectionType === 'multiple';

        try {
            await CategoryConfig.findOneAndUpdate(
                { guildId, category },
                { guildId, category, allowMultiple },
                { upsert: true }
            );

            appCache.del(`categoryConfigs_${guildId}`);

            await interaction.editReply({ content: `✅ Category \`${category}\` is now set to **${selectionType}** selection! Run \`/rolemenu update\` to apply changes.` });
        } catch(err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Failed to update category mode.' });
        }
    }
  }
};