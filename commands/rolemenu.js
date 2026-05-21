const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { buildRoleMenuPayload } = require('../builders/roleMenuBuilder');
const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('📋 Manage the role selection menu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('send').setDescription('Send a new role menu'))
    .addSubcommand(sub => sub.setName('update').setDescription('Update the active role menu automatically'))
    .addSubcommand(sub => sub.setName('add').setDescription('Add a new role to the menu')
        .addStringOption(opt => opt.setName('category').setDescription('Category name (e.g., gender, game, region)').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('The role to assign').setRequired(true))
        .addStringOption(opt => opt.setName('label').setDescription('Display label').setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji for the option').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('Optional description').setRequired(false))
    ),

async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    // Change ephemeral: true to flags: MessageFlags.Ephemeral
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
          { 
            guildId, 
            roleMenuChannelId: interaction.channel.id, 
            roleMenuMessageId: sentMessage.id 
          }, 
          { upsert: true }
        );

        await interaction.editReply({ content: '✅ Role menu sent!' });
      } else if (sub === 'update') {
        const guildData = await Guild.findOne({ guildId });
        
        if (!guildData || !guildData.roleMenuMessageId) {
          return interaction.editReply({ content: '❌ No active role menu found in database. Please use `/rolemenu send` to create one first.' });
        }

        try {
          const targetChannel = await interaction.client.channels.fetch(guildData.roleMenuChannelId);
          const targetMessage = await targetChannel.messages.fetch(guildData.roleMenuMessageId);
          
          await targetMessage.edit({ embeds: [embed], components });
          await interaction.editReply({ content: '🔄 Role menu updated automatically!' });
        } catch (err) {
          console.error("❌ Error updating role menu:", err);
          await interaction.editReply({ content: '❌ Could not find the old menu message (It might have been deleted). Please send a new one using `/rolemenu send`.' });
        }
      }
    }

    if (sub === 'add') {
       // Convert category to lowercase to maintain consistency (e.g., 'Game' and 'game' become one category)
       const category = interaction.options.getString('category').toLowerCase();
       const role = interaction.options.getRole('role');
       const label = interaction.options.getString('label');
       const emoji = interaction.options.getString('emoji');
       const description = interaction.options.getString('description');

       try {
         await Guild.findOneAndUpdate({ guildId }, { guildId }, { upsert: true });
         
         const newRole = new RoleOption({ guildId, category, label, value: role.id, emoji });
         if (description) newRole.description = description;
         await newRole.save();

         await interaction.editReply({ content: `✅ Added \`${label}\` to the \`${category}\` category!` });
       } catch(err) {
         console.error(err);
         await interaction.editReply({ content: '❌ Database error occurred.' });
       }
    }
  }
};