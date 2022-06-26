module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Punishments', {
    guild_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      default: true,
    },
    one_warn: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    two_warns: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    three_warns: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    four_warns: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    five_warns: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    ten_warns: {
      type: DataTypes.INTEGER,
      default: 0,
    }
  }, {
    timestamps: false,
  });
}