const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const WelcomeConfig = require('../models/WelcomeConfig'); 
const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('👋 Manage the server welcome system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('setup')
        .setDescription('Set up the welcome message and embed')
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
        .addStringOption(opt => opt.setName('embed_image') 
            .setDescription('Direct URL for the main banner image (must start with http/https)')
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      const embedTitle = interaction.options.getString('embed_title');
      const embedDescription = interaction.options.getString('embed_description');
      const embedColor = interaction.options.getString('embed_color');
      const embedThumbnail = interaction.options.getBoolean('embed_thumbnail');
      const embedImage = interaction.options.getString('embed_image'); 

      try {
        let configData = await WelcomeConfig.findOne({ guildId });
        if (!configData) {
          configData = new WelcomeConfig({ guildId });
        }

        configData.channelId = channel.id;
        
        // If an option is omitted, overwrite it with null/defaults instead of preserving old data
        configData.message = message ? message.replace(/\\n/g, '\n') : null;
        configData.embed.title = embedTitle ? embedTitle : null;
        configData.embed.description = embedDescription ? embedDescription.replace(/\\n/g, '\n') : null;
        
        // Handle HEX color validation, reset to default if empty
        if (embedColor) {
          if (/^#[0-9A-F]{6}$/i.test(embedColor)) {
            configData.embed.color = embedColor;
          } else {
            return interaction.editReply({ 
              content: '❌ Invalid hex color code! Please use a format like `#FF9B45`.', 
              flags: MessageFlags.Ephemeral 
            });
          }
        } else {
          configData.embed.color = '#FF9B45'; // Fallback to default schema color
        }
        
        // Handle thumbnail visibility, default to true if omitted
        configData.embed.thumbnail = embedThumbnail !== null ? embedThumbnail : true;

        // Handle main banner image URL validation, clear if empty
        if (embedImage) {
          if (embedImage.startsWith('http://') || embedImage.startsWith('https://')) {
            configData.embed.image = embedImage;
          } else {
            return interaction.editReply({ 
              content: '❌ Invalid image URL! The link must start with http:// or https://', 
              flags: MessageFlags.Ephemeral 
            });
          }
        } else {
          configData.embed.image = null; // Clear image path if not provided
        }

        // Save the cleaned configuration back to MongoDB
        await configData.save();

        // Generate the real-time visual preview
        const previewEmbed = buildWelcomeEmbed(interaction.member, configData.embed);
        
        let previewContent = `✅ **Welcome configuration updated for ${channel}!**\n\n📌 **Here is a live preview:**\n`;
        
        if (configData.message) {
          previewContent += configData.message
            .replace(/{user}/g, `<@${interaction.member.id}>`)
            .replace(/{server}/g, interaction.guild.name) + '\n';
        }

        await interaction.editReply({ 
          content: previewContent, 
          embeds: [previewEmbed],
          flags: MessageFlags.Ephemeral 
        });

      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '❌ Database error occurred.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};