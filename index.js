require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const guildMemberAdd = require('./events/guildMemberAdd');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', member => guildMemberAdd(member));

client.login(process.env.DISCORD_TOKEN);
