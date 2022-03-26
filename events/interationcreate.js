module.exports = {
	name: 'interactionCreate',
	execute(int) {
		console.log(`${int.user.tag} in #${int.channel.name} triggered an interaction.`);
	},
};