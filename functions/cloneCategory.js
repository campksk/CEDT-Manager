const { ChannelType } = require('discord.js');

// รูปแบบ placeholder: __key__ (ครอบด้วย underscore สองตัว)
// เลือกใช้แบบนี้เพราะ Discord text channel อนุญาตแค่ตัวเล็ก ตัวเลข "-" และ "_"
// เท่านั้น ตัวอักษรอย่าง { } จะถูกตัดทิ้งตั้งแต่ตอนตั้งชื่อ template จึงใช้ไม่ได้จริง
const PLACEHOLDER_REGEX = /__(\w+)__/g;

/**
 * แทนที่ placeholder รูปแบบ __key__ ในข้อความ ด้วยค่าจาก values
 * เช่น applyPlaceholders('group-__no__', { no: '5' }) => 'group-5'
 * ถ้าไม่มีค่าให้ key นั้นๆ จะปล่อย __key__ ไว้เหมือนเดิม (ไม่ error)
 *
 * @param {string} text
 * @param {Record<string, string>} values
 */
function applyPlaceholders(text, values = {}) {
  if (!text) return text;
  return text.replace(PLACEHOLDER_REGEX, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
  });
}

/**
 * หา key ของ placeholder ทั้งหมดที่ปรากฏในข้อความ เช่น
 * findPlaceholders('__no__-__team__') => ['no', 'team']
 * @param {string} text
 * @returns {string[]}
 */
function findPlaceholders(text) {
  if (!text) return [];
  return [...text.matchAll(PLACEHOLDER_REGEX)].map(m => m[1]);
}

/**
 * แปลงข้อความรูปแบบ "key1=value1,key2=value2" ให้เป็น object
 * รองรับตัวแปรกี่ตัวก็ได้ ชื่ออะไรก็ได้ (ไม่จำกัดเฉพาะ "no")
 * ค่าที่พิมพ์ผิดรูปแบบ (ไม่มี "=") จะถูกข้ามไปเฉยๆ ไม่ error
 *
 * @param {string|null} input
 * @returns {Record<string, string>}
 */
function parseValues(input) {
  const values = {};
  if (!input) return values;
  for (const pair of input.split(',')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) values[key] = value;
  }
  return values;
}

/**
 * Clone a category channel: creates a new category that copies the
 * template's permission overwrites, then clones every child channel
 * inside it (text, voice, announcement, forum, stage) in the same
 * order — copying name, type, topic, nsfw, slowmode, bitrate/user
 * limit (voice), and each child's own permission overwrites.
 *
 * ชื่อ (และ topic) ของหมวดหมู่/ช่อง สามารถมี placeholder เช่น __no__
 * ได้กี่ตัวก็ได้ ชื่ออะไรก็ได้ โดยจะถูกแทนที่ด้วยค่าที่ส่งมาทาง `values`
 *
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').CategoryChannel} templateCategory
 * @param {object} [opts]
 * @param {string|null} [opts.newName] - ชื่อหมวดหมู่ใหม่ (ถ้าไม่ระบุ ใช้ชื่อต้นแบบ) รองรับ __key__ เช่นกัน
 * @param {Record<string, string>} [opts.values] - ค่าที่จะใช้แทน __key__ เช่น { no: '5', team: 'os' }
 * @returns {Promise<{ newCategory: import('discord.js').CategoryChannel, clonedChannels: string[], unresolved: string[] }>}
 */
async function cloneCategory(guild, templateCategory, { newName, values = {} } = {}) {
  const copyOverwrites = (channel) =>
    channel.permissionOverwrites.cache.map(ow => ({
      id: ow.id,
      type: ow.type,
      allow: ow.allow.bitfield,
      deny: ow.deny.bitfield,
    }));

  const unresolved = new Set(findPlaceholders(newName || templateCategory.name).filter(k => !(k in values)));

  // 1) สร้างหมวดหมู่ใหม่ พร้อมคัดลอกสิทธิ์ (permission overwrites) จากต้นแบบ
  const categoryName = applyPlaceholders(newName || templateCategory.name, values);

  const newCategory = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    permissionOverwrites: copyOverwrites(templateCategory),
    reason: `Cloned from category "${templateCategory.name}"`,
  });

  // 2) หาช่องทั้งหมดที่อยู่ใต้หมวดหมู่ต้นแบบ เรียงตามตำแหน่งเดิม
  const children = guild.channels.cache
    .filter(ch => ch.parentId === templateCategory.id)
    .sort((a, b) => a.rawPosition - b.rawPosition);

  const clonedChannels = [];

  for (const child of children.values()) {
    findPlaceholders(child.name).forEach(k => { if (!(k in values)) unresolved.add(k); });
    if (child.topic) findPlaceholders(child.topic).forEach(k => { if (!(k in values)) unresolved.add(k); });

    const options = {
      name: applyPlaceholders(child.name, values),
      type: child.type,
      parent: newCategory.id,
      permissionOverwrites: copyOverwrites(child),
      reason: `Cloned from category "${templateCategory.name}"`,
    };

    if ('topic' in child && child.topic) options.topic = applyPlaceholders(child.topic, values);
    if ('nsfw' in child) options.nsfw = child.nsfw;
    if ('rateLimitPerUser' in child && child.rateLimitPerUser) {
      options.rateLimitPerUser = child.rateLimitPerUser;
    }
    if (child.type === ChannelType.GuildVoice || child.type === ChannelType.GuildStageVoice) {
      if (child.bitrate) options.bitrate = child.bitrate;
      if (child.userLimit) options.userLimit = child.userLimit;
    }

    const newChild = await guild.channels.create(options);
    clonedChannels.push(`${newChild.name} (${child.type === ChannelType.GuildVoice ? '🔊' : '💬'})`);
  }

  return { newCategory, clonedChannels, unresolved: [...unresolved] };
}

module.exports = { cloneCategory, applyPlaceholders, findPlaceholders, parseValues };
