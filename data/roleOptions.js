const roleOptions = {
  gender: [
    { label: 'Male', value: '1375676517920669739', description: 'เพศชาย', emoji: '🚹' },
    { label: 'Female', value: '1375676613898797176', description: 'เพศหญิง', emoji: '🚺' },
    { label: 'LGBTQ+', value: '1375676684199526461', description: 'เพศทางเลือก', emoji: '🏳️‍🌈' },
  ],
  color: [
    { label: 'Red', value: '1375698258357256263', emoji: '🔴', description: 'สีแดง' },
    { label: 'Pink', value: '1375698336098549903', emoji: '🌸', description: 'สีชมพู' },
    { label: 'DeepPink', value: '1375698408169279669', emoji: '💖', description: 'สีชมพูเข้ม' },
    { label: 'Coral', value: '1375698408383316058', emoji: '🪸', description: 'สีปะการัง' },
    { label: 'Orange', value: '1375698520530751569', emoji: '🟠', description: 'สีส้ม' },
    { label: 'Gold', value: '1375698520824348793', emoji: '💛', description: 'สีทอง' },
    { label: 'Yellow', value: '1375698521474203721', emoji: '🟡', description: 'สีเหลือง' },
    { label: 'Lavender', value: '1375698522233634876', emoji: '💜', description: 'สีลาเวนเดอร์' },
    { label: 'Violet', value: '1375698522883625040', emoji: '🌸', description: 'สีม่วงอ่อน' },
    { label: 'Purple', value: '1375698524041384137', emoji: '🟣', description: 'สีม่วง' },
    { label: 'SlateBlue', value: '1375698526574608414', emoji: '🔵', description: 'สีน้ำเงินอมม่วง' },
    { label: 'Lime', value: '1375698526826139802', emoji: '🟢', description: 'สีเขียวมะนาว' },
    { label: 'Teal', value: '1375699022383415406', emoji: '🧿', description: 'สีเขียวน้ำทะเล' },
    { label: 'Aqua', value: '1375699022823821372', emoji: '💧', description: 'สีฟ้าอมเขียว' },
    { label: 'SkyBlue', value: '1375699023331201054', emoji: '☁️', description: 'สีฟ้าท้องฟ้า' },
    { label: 'Brown', value: '1375699023973060628', emoji: '🟤', description: 'สีน้ำตาล' },
    { label: 'White', value: '1375699024757133384', emoji: '⚪', description: 'สีขาว' },
    { label: 'Gray', value: '1375699024765517904', emoji: '⚫', description: 'สีเทา' },
  ],
  game: [
    { label: 'Minecraft', value: '1375677320244760697', emoji: '⛏' },
    { label: 'Roblox', value: '1375712092472213584', emoji: '🎯' },
    { label: 'RoV', value: '1375712351738789988', emoji: '⚔️' },
    { label: 'Valorant', value: '1375677393234165850', emoji: '🔫' },
    { label: 'Counter Strike', value: '1375712351885594706', emoji: '🔫' },
    { label: 'Genshin Impact', value: '1375677485764706354', emoji: '✨' }
  ]
};

const roleGroups = {
  gender_select: roleOptions.gender.map(r => r.value),
  color_select: roleOptions.color.map(r => r.value),
  game_select: roleOptions.game.map(r => r.value),
};

module.exports = {
  roleOptions,
  roleGroups
};
