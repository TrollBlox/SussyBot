const startTime = Date.now();

const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const func = require('./utils/functions');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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
		func.error(error, int);
		await int.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(error => {
			if (error.name == 'INTERACTION_ALREADY_REPLIED') {
				// What do I do here?
			}
		});
	}

});

client.login(token);
