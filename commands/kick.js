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
      .setColor('BLURPLE');
  
    const func = require('../utils/functions');
    const user = int.options.getUser('user');
    const reason = int.options.getString('reason') || 'No reason provided';

    if (!int.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
      embededd.setDescription('You do not have permission to use this command!');
      await int.reply({ embeds: [ embededd ]});
      return await func.log(int, `tried to use /kick when they didn't have permission!`, client);
    }
    
    if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest || user == client.user) {
      embededd.setDescription('You cannot kick this person!');
      await int.reply({ embeds: [ embededd ]});
      return await func.log(int, `tried to /ban someone higher than themselves!`, client);
    }
  
    int.guild.members.kick(user.id, `${reason}`).catch(async error => {
      if (error.code == 50013) {
        embededd.setDescription('The bot is unable to kick this person. This is usually because the person you tried to kick is the server owner or the bot itself.');
        await int.reply({ embeds: [ embededd] });
        return await func.log(int, `tried to ban ${int.guild.name}'s owner, <@${await int.guild.fetchOwner().id}>!`, client)
      }
      await func.error(error, int, client);
    });

  
    embededd.setDescription(`Successfully kicked <@${user.id}> for ${reason}!`);
    await int.reply({ embeds: [ embededd ] });
    return await func.log(int, `kicked <@${user.id}> from this server for ${reason}!`, client);
  },
};
