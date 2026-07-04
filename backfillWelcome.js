/**
 * backfillWelcome.js
 * -------------------
 * One-off script to retroactively send welcome messages to members who
 * joined the server while the bot was offline (so guildMemberAdd never fired
 * for them).
 *
 * Place this file in the ROOT of your CEDT-Manager repo (same level as
 * index.js), so the relative requires below resolve correctly.
 *
 * USAGE:
 *   node backfillWelcome.js --guild <GUILD_ID> --start <ISO_DATE> --end <ISO_DATE> [--dry-run] [--delay 1500]
 *
 * EXAMPLE:
 *   node backfillWelcome.js --guild 123456789012345678 \
 *     --start "2026-07-01T00:00:00+07:00" \
 *     --end   "2026-07-03T18:30:00+07:00" \
 *     --dry-run
 *
 * Notes:
 * - --start / --end define the downtime window. Any member whose
 *   member.joinedAt falls inside [start, end] is treated as "missed".
 * - Bots are skipped automatically.
 * - --dry-run just logs who WOULD get a message, without sending anything.
 *   Always run with --dry-run first to sanity check the member list.
 * - There is no "already welcomed" tracking in this codebase, so do NOT run
 *   this twice for the same window without --dry-run, or people will get
 *   duplicate welcome messages.
 * - Uses the same .env (DISCORD_TOKEN, MONGO_URI) as the main bot.
 */

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const connectDB = require('./database/connect');
const WelcomeConfig = require('./models/WelcomeConfig');
const buildWelcomeEmbed = require('./builders/welcomeEmbedBuilder');

// ---- CLI arg parsing ----
function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const val = process.argv[idx + 1];
  return val && !val.startsWith('--') ? val : fallback;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const GUILD_ID = getArg('guild');
const START = getArg('start');
const END = getArg('end');
const DRY_RUN = hasFlag('dry-run');
const DELAY_MS = parseInt(getArg('delay', '1500'), 10);

if (!GUILD_ID || !START || !END) {
  console.error('❌ Missing required args.');
  console.error('Usage: node backfillWelcome.js --guild <GUILD_ID> --start <ISO_DATE> --end <ISO_DATE> [--dry-run] [--delay 1500]');
  process.exit(1);
}

const startDate = new Date(START);
const endDate = new Date(END);

if (isNaN(startDate) || isNaN(endDate)) {
  console.error('❌ --start or --end is not a valid date. Use ISO format, e.g. 2026-07-01T00:00:00+07:00');
  process.exit(1);
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch(); // populate cache with ALL members

    const configData = await WelcomeConfig.findOne({ guildId: GUILD_ID }).lean();
    if (!configData?.channelId) {
      console.error('❌ No welcome channel configured for this guild (WelcomeConfig.channelId missing).');
      process.exit(1);
    }

    const channel = guild.channels.cache.get(configData.channelId);
    if (!channel) {
      console.error(`❌ Could not find channel ${configData.channelId} in this guild.`);
      process.exit(1);
    }

    const missed = guild.members.cache.filter((member) => {
      if (member.user.bot) return false;
      if (!member.joinedAt) return false;
      return member.joinedAt >= startDate && member.joinedAt <= endDate;
    });

    console.log(`🔎 Found ${missed.size} member(s) who joined between ${startDate.toISOString()} and ${endDate.toISOString()}.`);

    if (missed.size === 0) {
      console.log('Nothing to send. Exiting.');
      process.exit(0);
    }

    for (const member of missed.values()) {
      console.log(`${DRY_RUN ? '[DRY RUN] Would send' : 'Sending'} welcome to ${member.user.tag} (joined ${member.joinedAt.toISOString()})`);

      if (!DRY_RUN) {
        const embed = buildWelcomeEmbed(member, configData?.embed);
        const payload = { embeds: [embed] };

        if (configData?.message) {
          payload.content = configData.message
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{server}/g, member.guild.name);
        }

        try {
          await channel.send(payload);
        } catch (err) {
          console.error(`  ❌ Failed to send to ${member.user.tag}:`, err.message);
        }

        await sleep(DELAY_MS);
      }
    }

    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during backfill:', err);
    process.exit(1);
  }
});

connectDB().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
