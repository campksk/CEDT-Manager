const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const sendRoleSelectMenu = require('../functions/sendRoleSelectMenu');
const updateRoleMenu = require('../functions/updateRoleMenu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('📋 จัดการเมนูเลือกรับยศ')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub
        .setName('send')
        .setDescription('ส่งเมนูเลือกรับยศใหม่')
    )
    .addSubcommand(sub =>
      sub
        .setName('update')
        .setDescription('อัปเดตเมนูเลือกรับยศเดิม')
        .addStringOption(opt =>
          opt.setName('message_id')
            .setDescription('ID ของข้อความเมนูรับยศเดิม')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'send') {
      await sendRoleSelectMenu(interaction.channel);
      await interaction.reply({ content: '✅ ส่งเมนูรับยศเรียบร้อยแล้ว!', ephemeral: true });
    }

    if (sub === 'update') {
      const messageId = interaction.options.getString('message_id');
      try {
        await updateRoleMenu(interaction.channel, messageId);
        await interaction.reply({ content: '🔄 อัปเดตเมนูรับยศเรียบร้อยแล้ว!', ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ ไม่สามารถอัปเดตเมนูได้ โปรดตรวจสอบว่า message ID ถูกต้องและบอทสามารถเข้าถึงข้อความนั้นได้', ephemeral: true });
      }
    }
  }
};
