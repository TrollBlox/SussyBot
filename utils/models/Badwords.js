module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Badwords', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
		guild_id: {
			type: DataTypes.STRING,
      allowNull: false,
		},
		badword: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	}, {
		timestamps: false,
	});
};