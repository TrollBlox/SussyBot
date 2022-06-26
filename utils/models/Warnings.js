module.exports = (sequelize, DataTypes) => {
	return sequelize.define("Warnings", {
		guild_and_user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
    warnings: {
      type: DataTypes.INTEGER,
      'default': 0,
      allowNull: false,
    }
	}, {
		timestamps: false,
	});
};