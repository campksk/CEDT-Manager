const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildRoleMenuPayload } = require('../builders/roleMenuBuilder');
const Guild = require('../models/Guild');
const RoleOption = require('../models/RoleOption');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('📋 จัดการเมนูเลือกรับยศ')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('send').setDescription('ส่งเมนูเลือกรับยศใหม่'))
    .addSubcommand(sub => sub.setName('update').setDescription('อัปเดตเมนูเลือกรับยศเดิม')
        .addStringOption(opt => opt.setName('message_id').setDescription('ID ของข้อความเมนูรับยศเดิม').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('add').setDescription('เพิ่มยศใน role menu')
        .addStringOption(opt => opt.setName('category').setDescription('ประเภทของ role').setRequired(true)
            .addChoices(
                { name: 'guild', value: 'guild'},
                { name: 'gender', value: 'gender' },
                { name: 'interested', value: 'interested' },
                { name: 'game', value: 'game' },
                { name: 'color', value: 'color'}
            ))
        .addRoleOption(opt => opt.setName('role').setDescription('ยศที่ต้องการเพิ่ม').setRequired(true))
        .addStringOption(opt => opt.setName('label').setDescription('ป้ายข้อความที่จะให้แสดง').setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('emoji ที่ต้องการให้แสดง').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('เพิ่มคำอธิบายในหน้าเลือก').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    await interaction.deferReply({ ephemeral: true });

    if (sub === 'send' || sub === 'update') {
      const { embed, components } = await buildRoleMenuPayload(guildId);
      
      if (components.length === 0) {
        return interaction.editReply({ content: "⚠️ ยังไม่มีการตั้งค่ายศใดๆ ในระบบ กรุณาใช้คำสั่ง add เพิ่มยศก่อน!" });
      }

      if (sub === 'send') {
        await interaction.channel.send({ embeds: [embed], components });
        await interaction.editReply({ content: '✅ ส่งเมนูรับยศเรียบร้อยแล้ว!' });
      } else if (sub === 'update') {
        const messageId = interaction.options.getString('message_id');
        try {
          const message = await interaction.channel.messages.fetch(messageId);
          await message.edit({ embeds: [embed], components });
          await interaction.editReply({ content: '🔄 อัปเดตเมนูรับยศเรียบร้อยแล้ว!' });
        } catch (err) {
          await interaction.editReply({ content: '❌ ไม่สามารถอัปเดตเมนูได้ โปรดตรวจสอบว่า Message ID ถูกต้อง' });
        }
      }
    }

    if (sub === 'add') {
       const category = interaction.options.getString('category');
       const role = interaction.options.getRole('role');
       const label = interaction.options.getString('label');
       const emoji = interaction.options.getString('emoji');
       const description = interaction.options.getString('description');

       try {
         // ลงทะเบียนเซิร์ฟเวอร์ไว้ในฐานข้อมูล (เผื่อยังไม่มี)
         await Guild.findOneAndUpdate(
           { guildId },
           { guildId },
           { upsert: true, new: true }
         );
         
         // เพิ่ม Role ชิ้นใหม่ลงฐานข้อมูล
         const newRole = new RoleOption({ guildId, category, label, value: role.id, emoji });
         if (description) newRole.description = description;
         await newRole.save();

         await interaction.editReply({ content: `✅ เพิ่มยศ \`${label}\` ในหมวดหมู่ \`${category}\` สำเร็จ!` });
       } catch(err) {
         console.error(err);
         await interaction.editReply({ content: '❌ ไม่สามารถเพิ่มยศได้ เกิดข้อผิดพลาดที่ Database' });
       }
    }
  }
};