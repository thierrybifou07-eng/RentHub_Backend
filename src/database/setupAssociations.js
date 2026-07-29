import {
  City,
  Country,
  Department,
  Role,
  User,
  Otp,
  UserStatus,
  Session,
  PropertyType,
  AnnouncementStatus,
  Announcement,
  MediaType,
  Media,
  Favorite,
} from "./models/index.js";

const setupAssociations = () => {
  Country.hasMany(Department, { foreignKey: "country_id" });
  Department.belongsTo(Country, { foreignKey: "country_id" });

  Department.hasMany(City, { foreignKey: "department_id" });
  City.belongsTo(Department, { foreignKey: "department_id" });

  User.hasMany(Session, { foreignKey: "user_id" });
  Session.belongsTo(User, { foreignKey: "user_id" });

  Role.hasMany(User, { foreignKey: "role_id" });
  User.belongsTo(Role, { foreignKey: "role_id" });

  UserStatus.hasMany(User, { foreignKey: "user_status_id" });
  User.belongsTo(UserStatus, { foreignKey: "user_status_id" });

  City.hasMany(User, { foreignKey: "city_id" });
  User.belongsTo(City, { foreignKey: "city_id" });

  User.hasMany(Otp, { foreignKey: "user_id" });
  Otp.belongsTo(User, { foreignKey: "user_id" });

  PropertyType.hasMany(Announcement, { foreignKey: "property_type_id" });
  Announcement.belongsTo(PropertyType, { foreignKey: "property_type_id" });

  AnnouncementStatus.hasMany(Announcement, { foreignKey: "status_id" });
  Announcement.belongsTo(AnnouncementStatus, { foreignKey: "status_id" });

  City.hasMany(Announcement, { foreignKey: "city_id" });
  Announcement.belongsTo(City, { foreignKey: "city_id" });

  User.hasMany(Announcement, { foreignKey: "user_id" });
  Announcement.belongsTo(User, { foreignKey: "user_id" });

  MediaType.hasMany(Media, { foreignKey: "media_type_id" });
  Media.belongsTo(MediaType, { foreignKey: "media_type_id" });

  User.hasMany(Media, { foreignKey: "mediable_id", scope: { mediable_type: "User" }, constraints: false });
  Media.belongsTo(User, { foreignKey: "mediable_id", constraints: false });

  Announcement.hasMany(Media, { foreignKey: "mediable_id", scope: { mediable_type: "Announcement" }, constraints: false });
  Media.belongsTo(Announcement, { foreignKey: "mediable_id", constraints: false });

  User.belongsToMany(Announcement, { through: Favorite, as: "favoriteAnnouncements", foreignKey: "user_id" });
  Announcement.belongsToMany(User, { through: Favorite, as: "favoritedBy", foreignKey: "announcement_id" });

  User.hasMany(Favorite, { foreignKey: "user_id" });
  Favorite.belongsTo(User, { foreignKey: "user_id" });

  Announcement.hasMany(Favorite, { foreignKey: "announcement_id" });
  Favorite.belongsTo(Announcement, { foreignKey: "announcement_id" });
};

setupAssociations();

export default setupAssociations;
