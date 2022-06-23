const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('User to view warnings for')
      .setRequired(true)),
  async execute(int, client) {
    const func = require('../utils/functions.js');
    const user = int.options.getUser('user');
    const embededd = new MessageEmbed()
      .setTitle("Warnings")
      .setColor("#F21717")

    if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      embededd.setDescription("You do not have permission to use this command!");
      return int.reply({ embeds: [ embededd ] });
    }

    const warns = await func.getManualWarns(int, user);
    embededd.setDescription(`<@${user.id}> has ${warns} warning${warns != 1 ? "s" : ""}.`);
    int.reply({ embeds: [ embededd ] });
    return func.log(int);

  }
};