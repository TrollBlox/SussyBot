const fs = require('fs');
const config = require('../config.json');
const { Guild, Badwords, GuildSettings, Punishments } = require('../dbObjects.js');
const { MessageEmbed, Permissions } = require('discord.js');
const { channel } = require('diagnostics_channel');

module.exports = {
  log: async function(int, text, client) {
    let author = int.user.id;
    for (i = 0; i <= config.coolIds.length; i++) {
      author = author.replace(`${config.coolIds[i]}`, `${config.coolNames[i]}`);
    }

    const loggedtext = `${new Date(Date.now())}: <@${author}> ${text}`;

    fs.appendFileSync('archives.txt', loggedtext + '\n');
    console.log(loggedtext);

    const logging_id = await this.getLoggingChannel(int.guild.id);
    const embededd = new MessageEmbed()
      .setTitle("Log")
      .setColor("BLURPLE");

    if (logging_id == -1) {
      embededd.setDescription("A log was attempted to be made in your server, but you do not have a logging channel set up.\n\nPlease use `/config logging set` to set the channel.");
      const owner = await int.guild.fetchOwner();
      return await owner.send({ embeds: [ embededd ] });
    }

    const logging_channel = await client.channels.fetch(logging_id);

    embededd.setDescription(`<@${int.user.id}> ${text}`);

    return await logging_channel.send({ embeds: [ embededd ] });
  },

  error: async function(text, int, client) {
    const text2 = `${new Date(Date.now())}: Error running command /${int.commandName}! ${text}.`;

    fs.appendFileSync('error.txt', text2 + '\n');
    console.log(text2);
    const channel = await client.channel.fetch(config.errorChannelId);
    return await channel.send(`\`\`\`${text2}\`\`\``);

  },

  warn: async function(msg, client) {
		let userWarn = await Guild.findOne({
			where: { guild_and_user_id: `${msg.guild.id}:${msg.author.id}` },
		});

		if (userWarn) {
			userWarn.warnings += 1;
			userWarn.save();
		} else {
		  Guild.create({ guild_and_user_id: `${msg.guild.id}:${msg.author.id}`, warnings: 1 });
      userWarn = await Guild.findOne({
        where: { guild_and_user_id: `${msg.guild.id}:${msg.author.id}` },
      });
    }

    return await this.logWarnings(msg.guild, msg.author, "Automatic word filter", msg.channel.id, client, userWarn.warnings);

  },

  manualWarn: async function(int, user, reason, client) {
    let userWarn = await Guild.findOne({
      where: { guild_and_user_id: `${int.guild.id}:${user.id}` },
    });

		if (userWarn) {
			userWarn.warnings += 1;
			userWarn.save();
		} else {
      Guild.create({ guild_and_user_id: `${int.guild.id}:${user.id}`, warnings: 1 });
		  userWarn = await Guild.findOne({
			  where: { guild_and_user_id: `${int.guild.id}:${user.id}` },
		  });
    }

    return await this.logWarnings(int.guild, user, reason, int.channel.id, client, userWarn.warnings);

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
  
  checkWords: async function(msg, client) {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;
    let badwords = await this.getBadwords(msg.guild.id);
    for (x in badwords) {
      badwords[x] = badwords[x].badword;
    }
    for (const x in badwords) {
      if (msg.content.toLowerCase().includes(badwords[x])) {
        msg.delete();

        return await this.warn(msg, client);
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
  },

  clearBadwords: async function(guild_id) {
    const badwords = await this.getBadwords(guild_id);
    for (const x in badwords) {
      return Badwords.destroy({
        where: { guild_id: guild_id },
      });
    }
  },

  setWarns: async function(guild_id, user_id, warns) {
    const userWarn = await Guild.findOne({
			where: { guild_and_user_id: `${guild_id}:${user_id}` },
		});

		if (userWarn) {
			userWarn.warnings = warns;
			return userWarn.save();
		}

		return Guild.create({ guild_and_user_id: `${guild_id}:${user_id}`, warnings: `${warns}` });
  },

  setLoggingChannel: async function(guild_id, logging_channel_id) {
    const settings = await GuildSettings.findOne({
      where: { guild_id: guild_id }
    });

    if (settings) {
      settings.logging_channel_id = logging_channel_id;
      return settings.save();
    }

    return GuildSettings.create({ guild_id: guild_id, logging_channel_id: logging_channel_id });

  },

  getLoggingChannel: async function(guild_id) {
    const logging_channel_id = await GuildSettings.findOne({
      attributes: ['logging_channel_id'],
      where: { guild_id: guild_id }
    });

    if (logging_channel_id) {
      return logging_channel_id.logging_channel_id;
    }

    return -1;

  },

  logWarnings: async function(guild, warneduser, reason, channel_id, client, warns) {
    if (await this.getPunishmentsEnabled(guild.id)) {
      const embededd = new MessageEmbed()
        .setTitle("Warning")
        .setColor("BLURPLE");
      const embededdDM = new MessageEmbed()
        .setTitle("Warning")
        .setColor("BLURPLE");

      const logging_channel_id = await this.getLoggingChannel(guild.id);

      let logging_channel;

      const member = guild.members.cache.get(warneduser.id);

      switch (await this.getPunishments(guild.id, warns)) {
        case null:
        case 1:
          await member.timeout(3600000, "Too many warnings");
          if (logging_channel_id == -1) {
            embededd.setDescription(`<@${warneduser.id}> was just timed out in ${guild.name} and you do not have a logging channel set up. \nPlease use \`/config logging\` to set it up.`);
            owner = await guild.fetchOwner();
            await owner.createDM();
            return await owner.send({ embeds: [ embededd ] });
          }
          logging_channel = await client.channels.fetch(logging_channel_id)
          embededd.setDescription(`You were just timed out in ${guild.name} for having too many warnings!`);
          await member.createDM();
          await member.send({ embeds: [ embededd ] });

          embededd.setDescription(`<@${warneduser.id}> was just timed out for having too many warnings!`);
          return await logging_channel.send({ embeds: [ embededd ] });
        case 2:
          await member.kick("Reached warn limit");
          if (logging_channel_id == -1) {
            embededd.setDescription(`<@${warneduser.id}> was just kicked from ${guild.name} and you do not have a logging channel set up. \nPlease use \`/config logging\` to set it up.`);
            owner = await guild.fetchOwner();
            await owner.createDM();
            return await owner.send({ embeds: [ embededd ] });
          }
          logging_channel = await client.channels.fetch(logging_channel_id)
          embededd.setDescription(`You were just kicked from ${guild.name} for having too many warnings!`);
          await member.createDM();
          await member.send({ embeds: [ embededd ] });

          embededd.setDescription(`<@${warneduser.id}> was just kicked for having too many warnings!`);
          return await logging_channel.send({ embeds: [ embededd ] });
        case 3:
          await member.ban({ days: 7, reason: "Too many warnings" });
          if (logging_channel_id == -1) {
            embededd.setDescription(`<@${warneduser.id}> was just temporarily banned in ${guild.name} and you do not have a logging channel set up. \nPlease use \`/config logging\` to set it up.`);
            owner = await guild.fetchOwner();
            await owner.createDM();
            return await owner.send({ embeds: [ embededd ] });
          }
          logging_channel = await client.channels.fetch(logging_channel_id)
          embededd.setDescription(`You were just banned for one week from ${guild.name} for having too many warnings!`);
          await member.createDM();
          await member.send({ embeds: [ embededd ] });

          embededd.setDescription(`<@${warneduser.id}> was just temporarily banned for having too many warnings!`);
          return await logging_channel.send({ embeds: [ embededd ] });
        case 4:
          await member.ban({ reason: "Too many warnings" });
          if (logging_channel_id == -1) {
            embededd.setDescription(`<@${warneduser.id}> was just banned in ${guild.name} and you do not have a logging channel set up. \nPlease use \`/config logging\` to set it up.`);
            owner = await guild.fetchOwner();
            await owner.createDM();
            return await owner.send({ embeds: [ embededd ] });
          }
          logging_channel = await client.channels.fetch(logging_channel_id)
          embededd.setDescription(`You were just perma-banned from ${guild.name} for having too many warnings!`);
          await member.createDM();
          await member.send({ embeds: [ embededd ] });

          embededd.setDescription(`<@${warneduser.id}> was just banned for having too many warnings!`);
          return await logging_channel.send({ embeds: [ embededd ] });
        default:
          if (logging_channel_id == -1) {
            embededd.setDescription(`<@${warneduser.id}> was just warned in ${guild.name} and you do not have a logging channel set up. \nPlease use \`/config logging\` to set it up.`);
            owner = await guild.fetchOwner();
            await owner.createDM();
            return await owner.send({ embeds: [ embededd ] });
          }
          logging_channel = await client.channels.fetch(logging_channel_id)
          embededd.setDescription(`Your message was warned for ${reason}. You now have ${warns} warnings.`);
          await member.createDM();
          await member.send({ embeds: [ embededd ] });

          embededd.setDescription(`<@${warneduser.id}> was warned in <#${channel_id}> for ${reason}! They now have ${warns} warnings.`);
          return await  logging_channel.send({ embeds: [ embededd ] });
      }
    }
  },

  getPunishments: async function(guild_id, i) {
    const punishments = await Punishments.findOne({
      where: { guild_id: guild_id }
    });
    if (punishments) {
      switch (i) {
        case 1:
          return punishments.one_warn;
        case 2:
          return punishments.two_warns;
        case 3:
          return punishments.three_warns;
        case 4:
          return punishments.four_warns;
        case 5:
          return punishments.five_warns;
        case 10:
          return punishments.ten_years;
        default:
          return -1;
      }
    }

    return -1;
  },

  setPunishment: async function(guild_id, warns, punishment) {
    const setting = await Punishments.findOne({
      where: { guild_id: guild_id }
    });
    if (setting) {
      switch (warns) {
        case 1:
          setting.one_warn = punishment;
          break;
        case 2:
          setting.two_warns = punishment;
          break;
        case 3:
          setting.three_warns = punishment;
          break;
        case 4:
          setting.four_warns = punishment;
          break;
        case 5:
          setting.five_warns = punishment;
          break;
        case 10:
          setting.ten_warns = punishment;
          break;
      }
      return;
    }

    switch (warns) {
      case 1:
        await Punishments.create({
          guild_id: guild_id, one_warn: punishment 
        });
        break;
      case 2:
        await Punishments.create({
          guild_id: guild_id, two_warns: punishment 
        });
        break;
      case 3:
        await Punishments.create({
          guild_id: guild_id, three_warns: punishment 
        });
        break;
      case 4:
        await Punishments.create({
          guild_id: guild_id, four_warns: punishment 
        });
        break;
      case 5:
        await Punishments.create({
          guild_id: guild_id, five_warns: punishment 
        });
        break;
      case 10:
        await Punishments.create({
          guild_id: guild_id, ten_warns: punishment 
        });
        break;
    }
    return;

  },

  logMessage: function(msg) {
    let author = msg.author.id;
    for (i = 0; i <= config.coolIds.length; i++) {
      author = author.replace(`${config.coolIds[i]}`, `${config.coolNames[i]}`);
    }

    const text = `${new Date(msg.createdAt)} - ${author} said in ${msg.guild.name} #${msg.channel.name}: "${msg.content}"\n`

    return fs.appendFileSync('messages.txt', text);

  },

  getPunishmentsEnabled: async function(guild_id) {
    const enabled = await Punishments.findOne({
      where: { guild_id: guild_id }
    });

    if (enabled) {
      return enabled.enabled;
    }

    return -1;

  },

  setPunishmentsEnabled: async function(guild_id, enabled) {
    const isEnabled = await Punishments.findOne({
      where: { guild_id: guild_id }
    });

    if (isEnabled) {
      return isEnabled.enabled = enabled;
    }

    return await Punishments.create({ guild_id: guild_id, enabled: enabled});

  },

  getBadwordsEnabled: async function(guild_id) {
    const badwords = await GuildSettings.findOne({
      where: { guild_id: guild_id }
    });

    if (badwords) {
      return badwords.enabled;
    }

    return -1;

  },

  setBadwordsEnabled: async function(guild_id, enabled) {
    const badwords = await GuildSettings.findOne({
      where: { guild_id: guild_id }
    });

    if (badwords) {
      return badwords.badwords_enabled = enabled;
    }

    return await Badwords.create({ guild_id: guild_id, logging_channel_id: -1, badwords_enabled: enabled });

  }

};
