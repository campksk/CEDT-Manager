const sendWelcomeEmbed = require('../functions/sendWelcomeEmbed');

module.exports = async function (member) {
  await sendWelcomeEmbed(member);
};
