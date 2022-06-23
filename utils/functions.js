const fs = require('fs');
const config = require('../config.json');
const { Guild, Badwords } = require('../dbObjects.js');
const { MessageEmbed, Permissions } = require('discord.js');

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

  },

  warn: async function(msg) {
		const userWarn = await Guild.findOne({
			where: { guild_and_user_id: `${msg.guild.id}:${msg.author.id}` },
		});

		if (userWarn) {
			userWarn.warnings += 1;
			return userWarn.save();
		}

		return Guild.create({ guild_and_user_id: `${msg.guild.id}:${msg.author.id}`, warnings: 1 });
  },

  maualWarn: async function(int, user) {
		const userWarn = await Guild.findOne({
			where: { guild_and_user_id: `${int.guild.id}:${user.id}` },
		});

		if (userWarn) {
			userWarn.warnings += 1;
			return userWarn.save();
		}

		return Guild.create({ guild_and_user_id: `${int.guild.id}:${user.id}`, warnings: 1 });
  },

  getWarns: async function(msg) {
		const user = await Guild.findOne({
      attributes: ['warnings'],
      where: { guild_and_user_id: `${msg.guild.id}:${msg.author.id}` }
    });
    try {
      return user.warnings;
    } catch {
      return 0;
    }
	},

  getManualWarns: async function(int, user) {
    const userWarns = await Guild.findOne({
      where: { guild_and_user_id: `${int.guild.id}:${user.id}` }
    });
    try {
    return userWarns.warnings;
  } catch {
    return 0;
  }
  },
  
  checkWords: async function(msg) {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;
    let badwords = await this.getBadwords(msg.guild.id);
    for (x in badwords) {
      badwords[x] = badwords[x].badword;
    }
    for (const x in badwords) {
      if (msg.content.toLowerCase().includes(badwords[x])) {
        msg.delete();
        const embededd = new MessageEmbed()
          .setTitle('Warn')
          .setColor('#F21717');
    
        embededd.setDescription(`Your message \'${msg.content}\' was warned. You now have ${await this.getWarns(msg)} warnings.`);
        msg.author.createDM();
        msg.author.send({ embeds: [ embededd ] });

        return await this.warn(msg);
      }
    }
  },

  getBadwords: async function(guild_id) {
    const badwords = await Badwords.findAll({
      attributes: ['badword'],
      where: { guild_id: guild_id }
    });
    return badwords;
  },

  addBadword: async function(guild_id, badword) {
    return Badwords.create(
      { guild_id: guild_id, badword: `${badword}` }
    );
  },

  removeBadword: async function(guild_id, badword) {
    return Badwords.destroy({
      where: {guild_id: guild_id, badword: badword }
    });
  }

};
