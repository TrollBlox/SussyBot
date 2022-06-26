const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Guild = require('./utils/models/Warnings.js')(sequelize, Sequelize.DataTypes);
const Badwords = require('./utils/models/Badwords.js')(sequelize, Sequelize.DataTypes);
const GuildSettings = require('./utils/models/GuildSettings.js')(sequelize, Sequelize.DataTypes);
const Punishments = require('./utils/models/Punishments.js')(sequelize, Sequelize.DataTypes);
Badwords.removeAttribute('id');

module.exports = { Guild, Badwords, GuildSettings, Punishments };