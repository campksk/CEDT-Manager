const fs = require("fs")

const rdata = fs.readFileSync("roleOptions.json", 'utf-8');
const roleOptions = JSON.parse(rdata)

const roleGroups = {
  gender_select: roleOptions.gender.map(r => r.value),
  color_select: roleOptions.color.map(r => r.value),
  game_select: roleOptions.game.map(r => r.value),
  interested_select: roleOptions.interested.map(r => r.value),
};

module.exports = {
  roleOptions,
  roleGroups
};
