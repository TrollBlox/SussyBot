const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const badwords = require('./badwords.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badword')
    .setDescription('Add or remove badwords')
    .addStringOption(option =>
      option.setName('choice')
      .setDescription('add or remove words')
      .setRequired(true)
      .setChoices([
        [ 'add', 'a' ],
        [ 'remove', 'r' ],
      ]))
    .addStringOption(option =>
      option.setName('badword')
      .setDescription('The badword to add or remove. This will be ignored if you choose list.')
      .setRequired(true)),
  async execute(int, client) {
    const func = require('../utils/functions.js');
    const choice = int.options.getString('choice');
    let badword = int.options.getString('badword').toLowerCase();
    const embededd = new MessageEmbed()
      .setTitle('Badword')
      .setColor('#F21717')

    if (!int.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      embededd.setDescription(`You do not have permission to use this command!`)
      return int.reply({ embeds: [ embededd ] })
    }

    if (String(badwords).includes('\s')) {
      embededd.setDescription(`This is for single words only.`);
      return int.reply({ embeds: [ embededd ] })
    }

    switch (choice) {
      case 'a':
        for (x in await func.getBadwords(int.guild.id)) {
          if (x === badword) {
            embededd.setDescription(`"||${badword}||" is already a badword!`);
            return int.reply({ embeds: [ embededd ] });
          }
        }
        await func.addBadword(int.guild.id, badword).catch(console.error());
        embededd.setDescription(`Successfully added "||${badword}||" as a badword!`);
        int.reply({ embeds: [ embededd ] });
        return func.log(int);
      case 'r':
        const stuf = await func.removeBadword(int.guild.id, badword);
        if (stuf == 0) {
          embededd.setDescription(`"||${badword}||" is not a badword!`);
          return int.reply({ embeds: [ embededd ] })
        }
        embededd.setDescription(`Successfully removed "||${badword}||" as a badword!`);
        int.reply({ embeds: [ embededd ] });
        return func.log(int)
    }

  }
}