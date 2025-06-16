const fs = require("fs")

const rdata = fs.readFileSync("roleOptions.json", 'utf-8');
let roleOptions = JSON.parse(rdata)

const roleGroups = {
  gender_select: roleOptions.gender.map(r => r.value),
  color_select: roleOptions.color.map(r => r.value),
  game_select: roleOptions.game.map(r => r.value),
  interested_select: roleOptions.interested.map(r => r.value),
};

function getvalidRoles(group) {
  if (group == "gender_select") return roleOptions.gender.map(r => r.value)
  if (group == "color_select") return roleOptions.color.map(r => r.value)
  if (group == "game_select") return roleOptions.game.map(r => r.value)
  if (group == "interested_select") return roleOptions.interested.map(r => r.value)
  return []
}

module.exports = {
  roleOptions,
  roleGroups,
  getvalidRoles
};
