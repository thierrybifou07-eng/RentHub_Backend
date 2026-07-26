import {
  City,
  Country,
  Department,
  Role,
  User,
  Otp,
  UserStatus,
} from "./models/index.js";

const setupAssociations = () => {
  Department.hasMany(City, { foreignKey: "department_id" });
  City.belongsTo(Department, { foreignKey: "department_id" });

  Role.hasMany(User, { foreignKey: "role_id" });
  User.belongsTo(Role, { foreignKey: "role_id" });


  UserStatus.hasMany(User, { foreignKey: "user_status_id" });
  User.belongsTo(UserStatus, { foreignKey: "user_status_id" });

  City.hasMany(User, { foreignKey: "city_id" });
  User.belongsTo(City, { foreignKey: "city_id" });

  User.hasMany(Otp, { foreignKey: "user_id" });
  Otp.belongsTo(User, { foreignKey: "user_id" });

};

setupAssociations();

export default setupAssociations;
