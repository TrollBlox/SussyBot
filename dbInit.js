const startTime = Date.now();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./utils/models/Guild.js')(sequelize, Sequelize.DataTypes);
const Badwords = require('./utils/models/Badwords.js')(sequelize, Sequelize.DataTypes);
Badwords.removeAttribute('id');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
  if (force) {
    console.log(`${new Date(Date.now)}: Database synced in ${(Date.now() - startTime) / 1000} seconds!`);
  } else {
    console.log(`${new Date(Date.now)}: Database synced in ${(Date.now() - startTime) / 1000} seconds!`);
  }
	sequelize.close();
}).catch(console.error);