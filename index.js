const Sequelize = require('sequelize');
const startTime = Date.now();
const fs = require('node:fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const func = require('./utils/functions');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`${new Date(Date.now())}: Logged in as ${client.user.tag} in ${(Date.now() - startTime) / 1000} seconds!`);
});

client.on('interactionCreate', async int => {
	if (!int.isCommand()) return;

  const command = client.commands.get(int.commandName);

	if (!command) return;

	try {   
		await command.execute(int, client);
	} catch (error) {
		await func.error(error, int, client);
		await int.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(async error => {
			if (error.name == 'INTERACTION_ALREADY_REPLIED') {
				await func.error(error, int, client);
				// What do I do here?
			}
		});
	}

});

client.on('messageCreate', async msg => {
	if (msg.author == client.user) return;
	func.logMessage(msg);
	if (msg.mentions.has(client.user.id)) {
		const messages = [
			"Hello there",
			"Hi",
			"Hello",
			"Good morning"
		]
		await msg.reply({
			content: messages[Math.floor(Math.random() * messages.length)],
			allowedMentions: {
				repliedUser: false
			}
		});
	}
	if (await func.getBadwordsEnabled(msg.guild.id)) {
		await func.checkWords(msg, client);
	}
});

client.on('guildCreate', async guild => {
	const channel = guild.channels.filter(c => c.type == 'text').find(x => x.positions == 0);
	const embededd = new MessageEmbed()
		.setTitle("New Server")
		.setColor("BLURPLE")
		.setDescription(`Hello! I am glad to be invited to ${guild.name}! Here are some commands to get you started: \n\n\`/config logging set\` - set the channel to log actions!\n\`/config badwords add\` - add words to the word filter!\n\`/config punishments set\` - setup punishment for warnings!\n\nFeel free to delete this message once you have read it.`);
	return await channel.send({ embeds: [ embededd ] });
})

function getCommands() {
  return client.commands;
}

module.exports = { getCommands }

client.login(token);
