const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user')
    .addUserOption(option =>
      option.setName('user')
      .setDescription('The user you want to ban')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
      .setDescription('The reason to ban that user')
      .setRequired(false)),
  async execute(int, client) {
    const embededd = new MessageEmbed()
      .setTitle('Ban')
      .setColor('#F21717');
  
    const func = require('../utils/functions');
    const user = int.options.getUser('user');
    const reason = int.options.getString('reason') || 'No reason provided';

    try {
      if (!int.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        embededd.setDescription('You do not have permission to use this command!');
        return int.reply({ embeds: [ embededd ]});
      }
      
      if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest) {
        embededd.setDescription('You cannot ban this person!');
        return int.reply({ embeds: [ embededd ]});
      }
  
      int.guild.members.ban(user.id, [0, `${reason}`]);

      func.log(int);
  
      embededd.setDescription(`Successfully Banned <@${user.id}> for ${reason}!`);
      return int.reply({ embeds: [ embededd ] });
      
    } catch (error) {
      func.error(error, int, client);
      embededd.setDescription(`Something went wrong Banning <@${user.id}>!`);
      return int.reply({ embeds: [ embededd ] });
    }
  },
};
