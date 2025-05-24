const fs = require('fs');
const path = require('path');
const { roleGroups } = require('../data/roleOptions');

const commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.data.name, command);
}

module.exports = async function (interaction) {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'เกิดข้อผิดพลาดในการเรียกคำสั่งนี้', ephemeral: true });
    }
    return;
  }

    if (interaction.isStringSelectMenu()) {
    const selectedRoleIds = interaction.values;
    const member = interaction.member;

    const validRoles = roleGroups[interaction.customId];
    if (!validRoles) return;

    const rolesToRemove = member.roles.cache.filter(role => validRoles.includes(role.id));
    await member.roles.remove(rolesToRemove);

    await member.roles.add(selectedRoleIds);

    await interaction.reply({ content: '✅ ตั้งค่ายศเรียบร้อยแล้ว!', ephemeral: true });
    }

};
