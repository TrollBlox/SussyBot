const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows the help screen'),
  async execute(int, c) {
    const app = require('../index.js');
    const func = require('../utils/functions.js');
    const embededd = new MessageEmbed()
      .setTitle('Help')
      .setColor('BLURPLE')
      .setDescription(`${app.getCommands().map(cmd => `/${cmd.data.name} - ${cmd.data.name == 'help' ? 'Shows this screen' : cmd.data.description}.`).join('\n').replaceAll('undefined', 'No description set')}`)

    await int.reply({ embeds: [embededd] });
    return await func.log(int, `viewed help message!`, c);
  },
}