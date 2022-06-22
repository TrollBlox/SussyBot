const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user')
    .addStringOption(option =>
      option.setName('user')
      .setDescription('The id of the user you want to unban')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
      .setDescription('The reason to unban that user')
      .setRequired(false)),
	async execute(int, client) {
    const embededd = new MessageEmbed()
      .setTitle('Unban')
      .setColor('#F21717');

    const func = require('../utils/functions');
    const userid = int.options.getString('user');
    const reason = int.options.getString('reason') || 'No reason provided';
    const user = client.users.fetch(userid).catch(error => {
      if (error.code == 50035) {
        embededd.setDescription(`<@${userid}> is not a valid user!`);
        return int.reply({ embeds: [ embededd ] });
      }
      func.error(error, int);
    });
    
    try {
      if (!int.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        embededd.setDescription('You do not have permission to use this command!');
        return int.reply({ embeds: [ embededd ]});
      }

      const banList = await int.guild.bans.fetch();

      const bannedUser = banList.find(user => user.id === user.id);

      if (!bannedUser) {
        embededd.setDescription(`<@${userid}> is not banned!`);
        return int.reply({ embeds: [ embededd ] });
      }

      int.guild.members.unban(userid).catch(error => {
        if (error.code == 50035) {
          embededd.setDescription(`<@${userid}> is not a valid user!`);
          return int.reply({ embeds: [ embededd ] });
        }
        
        console.error(error);
      });

      func.log(int);

      embededd.setDescription(`Successfully unbanned <@${userid}> for ${reason}!`);
      return int.reply({ embeds: [ embededd ] });
      
    } catch (error) {
      func.error(error, int, client);
      embededd.setDescription(`Something went wrong unbanning <@${userid}>!`);
      return int.reply({ embeds: [ embededd ] });
    }
	},
};
