const fs = require('fs');
const config = require('../config.json');

module.exports = {
  log: function(int) {
    let author = int.user.id;
    for (i = 0; i <= config.coolIds.length; i++) {
      author = author.replace(`${config.coolIds[i]}`, `${config.coolNames[i]}`);
    }

    const text = `${new Date(Date.now())}: ${author} used ${int.commandName} in #${int.channel.name}.`;

    fs.appendFileSync('archives.txt', text + '\n');
    return console.log(text);

  },

  error: function(text, int) {
    const text2 = `${new Date(Date.now())}: Error running command /${int.commandName}! ${text}.`;

    fs.appendFileSync('error.txt', text2 + '\n');
    return console.log(text2);

  }
};
