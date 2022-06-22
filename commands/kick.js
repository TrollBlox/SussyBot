const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('The user you want to kick')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
      .setDescription('The reason to kick that user')
      .setRequired(false)),
  async execute(int, client) {
    const embededd = new MessageEmbed()
      .setTitle('Kick')
      .setColor('#F21717');
  
    const func = require('../utils/functions');
    const user = int.options.getUser('user');
    const reason = int.options.getString('reason') || 'No reason provided';

    try {
      if (!int.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        embededd.setDescription('You do not have permission to use this command!');
        return int.reply({ embeds: [ embededd ]});
      }
      
      if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest) {
        embededd.setDescription('You cannot kick this person!');
        return int.reply({ embeds: [ embededd ]});
      }
  
      int.guild.members.kick(user.id, `${reason}`);

      func.log(int);
  
      embededd.setDescription(`Successfully kicked <@${user.id}> for ${reason}!`);
      return int.reply({ embeds: [ embededd ] });
      
    } catch (error) {
      func.error(error, int, client);
      embededd.setDescription(`Something went wrong kicking <@${user.id}>!`);
      return int.reply({ embeds: [ embededd ] });
    }
  },
};
