const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const sendRoleSelectMenu = require('../functions/sendRoleSelectMenu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('📋 ส่งเมนูเลือกรับยศ')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await sendRoleSelectMenu(interaction.channel);
    await interaction.reply({ content: '✅ ส่งเมนูรับยศเรียบร้อยแล้ว!', ephemeral: true });
  }
};
