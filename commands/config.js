const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const WelcomeConfig = require('../models/WelcomeConfig'); 
const buildWelcomeEmbed = require('../builders/welcomeEmbedBuilder'); // Import the builder for the preview

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
        .addStringOption(opt => opt.setName('embed_image') 
            .setDescription('Direct URL for the main banner image (must start with http/https)')
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (sub === 'welcome') {
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
        
        if (message !== null) {
          configData.message = message.replace(/\\n/g, '\n');
        }
        
        if (embedTitle !== null) configData.embed.title = embedTitle;
        
        // Do the same for the embed description
        if (embedDescription !== null) {
          configData.embed.description = embedDescription.replace(/\\n/g, '\n');
        }
        
        if (embedColor !== null) {
          if (/^#[0-9A-F]{6}$/i.test(embedColor)) {
            configData.embed.color = embedColor;
          } else {
            return interaction.editReply({ content: '❌ Invalid hex color code! Please use a format like `#FF9B45`.', flags: MessageFlags.Ephemeral });
          }
        }
        
        if (embedThumbnail !== null) configData.embed.thumbnail = embedThumbnail;

        if (embedImage !== null) {
          if (embedImage.startsWith('http://') || embedImage.startsWith('https://')) {
            configData.embed.image = embedImage;
          } else {
            return interaction.editReply({ content: '❌ Invalid image URL! The link must start with http:// or https://', flags: MessageFlags.Ephemeral });
          }
        }

        // Save to Database
        await configData.save();

        // Generate a preview using the admin who ran the command as the test subject
        const previewEmbed = buildWelcomeEmbed(interaction.member, configData.embed);
        
        let previewContent = `✅ **Welcome configuration updated for ${channel}!**\n\n📌 **Here is a live preview:**\n`;
        
        // Add plain text preview if it exists
        if (configData.message) {
          previewContent += configData.message
            .replace(/{user}/g, `<@${interaction.member.id}>`)
            .replace(/{server}/g, interaction.guild.name) + '\n';
        }

        // Send the success message along with the visual preview
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