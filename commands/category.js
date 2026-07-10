const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { cloneCategory, parseValues } = require('../functions/cloneCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('category')
    .setDescription('📁 จัดการหมวดหมู่ (category) ของเซิร์ฟเวอร์')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub => sub.setName('clone')
      .setDescription('โคลนหมวดหมู่ต้นแบบ พร้อมทุกช่องและสิทธิ์ภายใน')
      .addChannelOption(opt => opt.setName('template')
        .setDescription('หมวดหมู่ที่ต้องการใช้เป็นต้นแบบ')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true))
      .addStringOption(opt => opt.setName('name')
        .setDescription('ชื่อหมวดหมู่ใหม่ (ถ้าไม่ระบุ จะใช้ชื่อเดียวกับต้นแบบ) รองรับ __key__')
        .setRequired(false))
      .addStringOption(opt => opt.setName('values')
        .setDescription('ตัวแปรแทนที่ __key__ รูปแบบ key=value คั่นด้วย , เช่น no=5,team=os,year=2026')
        .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'clone') return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const templateOption = interaction.options.getChannel('template');
    const newName = interaction.options.getString('name');
    const values = parseValues(interaction.options.getString('values'));

    // ตัวเลือกจาก addChannelOption อาจเป็นข้อมูลบางส่วน ต้อง fetch ให้เต็มก่อน
    const templateCategory = await interaction.guild.channels.fetch(templateOption.id);

    if (!templateCategory || templateCategory.type !== ChannelType.GuildCategory) {
      return interaction.editReply({ content: '❌ กรุณาเลือกหมวดหมู่ (category) ที่ถูกต้อง' });
    }

    try {
      const { newCategory, clonedChannels, unresolved } = await cloneCategory(interaction.guild, templateCategory, { newName, values });

      const channelList = clonedChannels.length
        ? clonedChannels.map(name => `• ${name}`).join('\n')
        : '_ไม่มีช่องภายในหมวดหมู่ต้นแบบ_';

      const warning = unresolved.length
        ? `\n\n⚠️ พบ placeholder ที่ไม่ได้ระบุค่า: ${unresolved.map(k => `\`__${k}__\``).join(', ')} (ถูกปล่อยไว้ตามเดิม)`
        : '';

      await interaction.editReply({
        content: `✅ โคลนหมวดหมู่ **${templateCategory.name}** → **${newCategory.name}** สำเร็จ!\n\n${channelList}${warning}`
      });
    } catch (err) {
      console.error('❌ cloneCategory error:', err);
      await interaction.editReply({ content: '❌ โคลนหมวดหมู่ไม่สำเร็จ กรุณาตรวจสอบว่าบอทมีสิทธิ์ **Manage Channels**' });
    }
  }
};
