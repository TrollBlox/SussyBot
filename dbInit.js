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
    console.log('Database reset');
  } else {
	  console.log('Database synced');
  }

	sequelize.close();
}).catch(console.error);