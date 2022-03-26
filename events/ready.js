const startTime = Date.now();

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`${client.ws.ping}ms ${new Date(Date.now())}: Logged in as ${client.user.tag} in ${(Date.now() - startTime) / 1000} seconds!`);
	},
};