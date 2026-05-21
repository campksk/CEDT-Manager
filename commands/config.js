const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const WelcomeConfig = require('../models/WelcomeConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('⚙️ Server configurations')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('welcome')
        .setDescription('Configure the welcome message and embed system')
        .addChannelOption(opt => opt.setName('channel')
            .setDescription('Channel to send welcome messages')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addStringOption(opt => opt.setName('message')
            .setDescription('Text outside the embed. Use {user} and {server}.')
            .setRequired(false))
        .addStringOption(opt => opt.setName('embed_title')
            .setDescription('Title of the welcome embed')
            .setRequired(false))
        .addStringOption(opt => opt.setName('embed_description')
            .setDescription('Description of the embed. Use {user} and {server}.')
            .setRequired(false))
        .addStringOption(opt => opt.setName('embed_color')
            .setDescription('Hex color code for the embed (e.g., #FF9B45)')
            .setRequired(false))
        .addBooleanOption(opt => opt.setName('embed_thumbnail')
            .setDescription('Whether to show the user avatar as a thumbnail')
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    // Change ephemeral: true to flags: MessageFlags.Ephemeral
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (sub === 'welcome') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      const embedTitle = interaction.options.getString('embed_title');
      const embedDescription = interaction.options.getString('embed_description');
      const embedColor = interaction.options.getString('embed_color');
      const embedThumbnail = interaction.options.getBoolean('embed_thumbnail');

      try {
        // Fetch or create config from the new WelcomeConfig collection
        let configData = await WelcomeConfig.findOne({ guildId });
        if (!configData) {
          configData = new WelcomeConfig({ guildId });
        }

        // Update the main channel ID
        configData.channelId = channel.id;
        
        // Update external plain text message
        if (message !== null) configData.message = message;
        
        // Update embed details
        if (embedTitle !== null) configData.embed.title = embedTitle;
        if (embedDescription !== null) configData.embed.description = embedDescription;
        
        if (embedColor !== null) {
          // Validate HEX color code format
          if (/^#[0-9A-F]{6}$/i.test(embedColor)) {
            configData.embed.color = embedColor;
          } else {
            return interaction.editReply({ content: '❌ Invalid hex color code! Please use a format like `#FF9B45`.' });
          }
        }
        
        if (embedThumbnail !== null) configData.embed.thumbnail = embedThumbnail;

        await configData.save();

        await interaction.editReply({ content: `✅ Welcome system configuration successfully updated for ${channel}!` });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '❌ Database error occurred.' });
      }
    }
  }
};