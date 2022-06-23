const startTime = Date.now();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId } = require('./config.json');
    
const rest = new REST({ version: '9' }).setToken(token);

rest.get(Routes.applicationCommands(clientId))
    .then(data => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises)
    }).then(() =>
    console.log(`${new Date(Date.now())}: Removed application (/) commands in ${(Date.now() - startTime) / 1000} seconds!`))
    .catch(console.error);
