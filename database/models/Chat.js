import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const Chat = sequelize.define("Chat", {
  chat_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  paranoid: false
});

export default Chat;