const startTime = Date.now();

const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// client.once('ready', () => {
// 	console.log(`${client.ws.ping}ms ${new Date(Date.now())}: Logged in as ${client.user.tag} in ${(Date.now() - startTime) / 1000} seconds!`);
// });

// client.on('interactionCreate', async int => {
// 	if (!int.isCommand()) return;

//   const command = client.commands.get(int.commandName);

// 	if (!command) return;

// 	try {
// 		await command.execute(int);
// 	} catch (error) {
// 		console.error(error);
// 		await int.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}

// });

client.login(token);
