const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('⚙️ Server configurations')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('welcome')
        .setDescription('Configure the welcome message system')
        .addChannelOption(opt => opt.setName('channel')
            .setDescription('Channel to send welcome messages')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addStringOption(opt => opt.setName('message')
            .setDescription('Custom text. Use {user} to ping, and {server} for server name.')
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ ephemeral: true });

    if (sub === 'welcome') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');

      try {
        const updateData = { welcomeChannelId: channel.id };
        if (message) updateData.welcomeMessage = message;

        await Guild.findOneAndUpdate(
          { guildId },
          updateData,
          { upsert: true, new: true }
        );

        await interaction.editReply({ content: `✅ Welcome channel set to ${channel}.\n${message ? `Message updated to: \n> ${message}` : ''}` });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '❌ Database error occurred.' });
      }
    }
  }
};