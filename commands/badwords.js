const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badwords')
    .setDescription('Lists badwords on this server'),
  async execute(int, client) {
    const func = require('../utils/functions.js');
    const embededd = new MessageEmbed()
      .setTitle('Badwords')
      .setColor('#F21717')

    if (!int.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      embededd.setDescription('You do not have permission to use this command!');
      return int.reply({ embeds: [ embededd ] });
    }

    
    let badwords = await func.getBadwords(int.guild.id);
    for (x in badwords) {
      badwords[x] = badwords[x].badword;
    }
    if (badwords.length === 0) {
      embededd.setDescription(`You have no badwords registered for ${int.guild.name}!`);
      int.reply({ embeds: [ embededd ] });
      return func.log(int);
    } else {
      badwords = badwords.join("\n");
      embededd.setDescription(`Badwords for ${int.guild.name} are:\n\n${badwords}`);
      int.reply({ embeds: [ embededd ] });
      return func.log(int);
    }

  }
}