const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const sendRoleSelectMenu = require('../functions/sendRoleSelectMenu');
const updateRoleMenu = require('../functions/updateRoleMenu');
const {roleOptions} = require('../data/roleOptions.js')
const fs = require("fs")

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
    )
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('เพิ่มยศใน role menu')
        .addStringOption(opt =>
        opt.setName('category')
          .setDescription('ประเภทของ role')
          .setRequired(true)
          .addChoices(
            { name: 'gender', value: 'gender' },
            { name: 'color', value: 'color'},
            { name: 'game', value: 'game' },
            { name: 'interested', value: 'interested' },
          )
        )
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('ยสที่ต้องการเพิ่ม')
            .setRequired(true)
        )
        .addStringOption(opt => 
          opt.setName('label')
            .setDescription('ป้ายข้อความที่จะให้แสดง')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('emoji')
            .setDescription('emoji ที่ต้องการให้แสดง')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription('เพิ่มคำอธิบายในหน้าเลือก')
            .setRequired(true)
        )
    )
    ,

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

    if (sub === 'add') {
      const category = interaction.options.getString('category');
      const role = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji');
      const description = interaction.options.getString('description');
      
      roleOptions[category].push({label, value: role.id, description, emoji})
      fs.writeFileSync("roleOptions.json", JSON.stringify(roleOptions, null, 2))
    }
  }
};
