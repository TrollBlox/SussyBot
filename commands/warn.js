const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a user')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('The user to warn')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
      .setDescription('Reason for warn')
      .setRequired(false)),
  async execute(int, client) {
    const embededd = new MessageEmbed()
      .setTitle('Warn')
      .setColor('#F21717');

    const func = require('../utils/functions.js');
    const user = int.options.getUser('user');
    const reason = int.options.getString('reason') || 'No reason provided';

    if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      embededd.setDescription('You do not have permission to use this command!');
      return int.reply({ embeds: [ embededd ] });
    }

    if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest || int.guild.members.cache.get(user.id).permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      embededd.setDescription('You cannot warn this person!');
      return int.reply({ embeds: [ embededd ] });
    }

    func.manualWarn(int, user).catch(console.error());

    const embededdDM = new MessageEmbed()
      .setTitle("Warn")
      .setColor("#F21717")
      .setDescription(`You have been warned in ${int.guild.name} by a moderator for ${reason}`);
    user.createDM();
    user.send({ embeds: [ embededdDM ] });

    embededd.setDescription(`Successfully warned <@${user.id}> for ${reason}`);
    int.reply({ embeds: [ embededd ] });
    return func.log(int);
      
  }
}
