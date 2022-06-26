const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a user')
    .addSubcommand(subcommmandgroup =>
      subcommmandgroup.setName('add')
      .setDescription('Adds a warn to the user')
      .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for warn')
        .setRequired(false)))
    .addSubcommand(subcommmandgroup =>
      subcommmandgroup.setName('set')
      .setDescription('Set warnings for a user')
      .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to set warnings')
        .setRequired(true))
      .addIntegerOption(option =>
        option.setName('warnings')
        .setDescription('The warnings to set the user to')
        .setRequired(true)))
    .addSubcommand(subcommmandgroup =>
      subcommmandgroup.setName('view')
      .setDescription('View warnings for a user')
      .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to view warnings for')
        .setRequired(true))),
  async execute(int, client) {
    const embededd = new MessageEmbed()
      .setTitle(`warn:${int.options.getSubcommand()}`)
      .setColor('BLURPLE');

    const func = require('../utils/functions.js');
    const user = int.options.getUser('user');
    const reason = int.options.getString('reason') || 'No reason provided';
    const warns2 = int.options.getInteger('warnings');

    if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      embededd.setDescription('You do not have permission to use this command!');
      await int.reply({ embeds: [ embededd ]});
      return await func.log(int, `tried to use /kick when they didn't have permission!`, client);
    }

    switch (int.options.getSubcommand()) {
      case 'add':
        if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest) {
          embededd.setDescription('You cannot warn this person!');
          await int.reply({ embeds: [ embededd ]});
          return await func.log(int, `tried to /ban someone higher than themselves!`, client);
        }

        await func.manualWarn(int, user, reason, client);

        const embededdDM = new MessageEmbed()
          .setTitle("Warn")
          .setColor("#F21717")
          .setDescription(`You have been warned in ${int.guild.name} by a moderator for ${reason}`);
        await user.createDM();
        await user.send({ embeds: [ embededdDM ] });

        embededd.setDescription(`Successfully warned <@${user.id}> for ${reason}`);
        await int.reply({ embeds: [ embededd ] });
        return await func.log(int, `warned <@${user.id}> for ${reason}!`, client);
      case 'set':
        if (int.member.roles.highest > int.guild.members.cache.get(user.id).roles.highest) {
          embededd.setDescription('You cannot set warns for this person!');
          await int.reply({ embeds: [ embededd ]});
          return await func.log(int, `tried to /ban someone higher than themselves!`, client);
        }
    
        if (warns2 < 0) {
          embededd.setDescription('You cannot set warnings to a negative number!');
          await int.reply({ embeds: [ embededd ] });
          return await func.log(int, `tried to set <@${user.id}>'s warnings to a negative number!`, client);
        }
    
        await func.setWarns(int.guild.id, user.id, warns2);
        embededd.setDescription(`Successfully set <@${user.id}>'s warnings to ${warns2}!`);
        await int.reply({ embeds: [ embededd ] });
        return await func.log(int, `set <@${user.id}'s warnings to ${warns2}!`, client);
      case 'view':
        const warns = await func.getManualWarns(int, user);
        embededd.setDescription(`<@${user.id}> has ${warns} warning${warns != 1 ? "s" : ""}.`);
        await int.reply({ embeds: [ embededd ] });
        return await func.log(int, `viewed warnings for <@${user.id}>!`, client);

    }
      
  }
}
