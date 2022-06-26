module.exports = (sequelize, DataTypes) => {
  return sequelize.define('GuildSettings', {
    guild_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    logging_channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    badwords_enabled: {
      type: DataTypes.BOOLEAN,
      default: true,
    }
  }, {
    timestamps: false,
  });
};