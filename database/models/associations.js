import Media from "./Media.js";
import MediaType from "./MediaType.js";
import Property from "./Property.js";
import PropertyType from "./PropertyType.js";
import City from "./City.js";
import Department from "./Department.js";
import PropertyStatus from "./PropertyStatus.js";
import User from "./User.js";
import Role from "./Role.js";
import UserStatus from "./UserStatus.js";
import Announcement from "./Announcement.js";
import AnnouncementType from "./AnnouncementType.js";
import AnnouncementStatus from "./AnnouncementStatus.js";
import Amenity from "./Amenity.js";
import PropertyAmenities from "./PropertyAmenities.js";
import Chat from "./Chat.js";
import UserChat from "./UserChat.js";
import Favorites from "./Favorite.js";
import Subscription from "./Subscription.js";
import SubscriptionType from "./SubscriptionType.js";
import SubscriptionStatus from "./SubscriptionStatus.js";
import Booking from "./Booking.js";
import Message from "./Message.js";
import MessageStatus from "./MessageStatus.js";
import ReportStatus from "./ReportStatus.js";
import Report from "./Report.js";
import Country from "./Country.js";

export function setupAssociations() {
  // 0. Country <-> Department
  Country.hasMany(Department, { foreignKey: "country_id" });
  Department.belongsTo(Country, { foreignKey: "country_id" });

  // 1. Department <-> City
  Department.hasMany(City, { foreignKey: "department_id" });
  City.belongsTo(Department, { foreignKey: "department_id" });

  // 2. User refs: City, Role, UserStatus
  City.hasMany(User, { foreignKey: "city_id" });
  User.belongsTo(City, { foreignKey: "city_id" });

  Role.hasMany(User, { foreignKey: "role_id" });
  User.belongsTo(Role, { foreignKey: "role_id" });

  UserStatus.hasMany(User, { foreignKey: "user_status_id" });
  User.belongsTo(UserStatus, { foreignKey: "user_status_id" });

  // 3. Property refs: PropertyType, City, PropertyStatus, User[owner]
  PropertyType.hasMany(Property, { foreignKey: "property_type_id" });
  Property.belongsTo(PropertyType, { foreignKey: "property_type_id" });

  City.hasMany(Property, { foreignKey: "city_id" });
  Property.belongsTo(City, { foreignKey: "city_id" });

  PropertyStatus.hasMany(Property, { foreignKey: "property_status_id" });
  Property.belongsTo(PropertyStatus, { foreignKey: "property_status_id" });

  User.hasMany(Property, { foreignKey: "owner_id" });
  Property.belongsTo(User, { foreignKey: "owner_id" });

  // 4. Media: MediaType, Property[CASCADE], User[CASCADE]
  MediaType.hasMany(Media, { foreignKey: "media_type_id" });
  Media.belongsTo(MediaType, { foreignKey: "media_type_id" });

  Property.hasMany(Media, { foreignKey: "property_id", onDelete: "CASCADE" });
  Media.belongsTo(Property, { foreignKey: "property_id", onDelete: "CASCADE" });

  User.hasMany(Media, { foreignKey: "user_id", onDelete: "CASCADE" });
  Media.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

  // 5. Announcement: Property[CASCADE], AnnouncementType, AnnouncementStatus, User
  Property.hasMany(Announcement, { foreignKey: "property_id", onDelete: "CASCADE" });
  Announcement.belongsTo(Property, { foreignKey: "property_id", onDelete: "CASCADE" });

  AnnouncementType.hasMany(Announcement, { foreignKey: "announcement_type_id" });
  Announcement.belongsTo(AnnouncementType, { foreignKey: "announcement_type_id" });

  AnnouncementStatus.hasMany(Announcement, { foreignKey: "announcement_status_id" });
  Announcement.belongsTo(AnnouncementStatus, { foreignKey: "announcement_status_id" });

  User.hasMany(Announcement, { foreignKey: "lister_id" });
  Announcement.belongsTo(User, { foreignKey: "lister_id" });

  //6 User -> Booking, Message, [Chat]
  User.hasMany(Booking, { foreignKey: "tenant_id" });
  Booking.belongsTo(User, { foreignKey: "tenant_id" });

  Chat.hasMany(Message, { foreignKey: "chat_id" });
  Message.belongsTo(Chat, { foreignKey: "chat_id" });

  User.hasMany(Message, { foreignKey: "sender_id" });
  Message.belongsTo(User, { foreignKey: "sender_id" });

  MessageStatus.hasMany(Message, { foreignKey: "message_status_id" });
  Message.belongsTo(MessageStatus, { foreignKey: "message_status_id" });

  // 7. Property <-> Amenity M:N
  Property.belongsToMany(Amenity, {
    through: PropertyAmenities,
    foreignKey: "property_id",
    otherKey: "amenity_id",
    onDelete: "CASCADE"
  });
  Amenity.belongsToMany(Property, {
    through: PropertyAmenities,
    foreignKey: "amenity_id",
    otherKey: "property_id",
    onDelete: "CASCADE"
  });

  // 8. User <-> Chat M:N
  User.belongsToMany(Chat, {
    through: UserChat,
    foreignKey: "user_id",
    otherKey: "chat_id",
    onDelete: "CASCADE"
  });
  Chat.belongsToMany(User, {
    through: UserChat,
    foreignKey: "chat_id",
    otherKey: "user_id",
    onDelete: "CASCADE"
  });

  // 9. User <-> Property Favorites M:N
  User.belongsToMany(Property, {
    through: Favorites,
    foreignKey: "user_id",
    otherKey: "property_id",
    as: "FavoriteProperties",
    onDelete: "CASCADE"
  });
  Property.belongsToMany(User, {
    through: Favorites,
    foreignKey: "property_id",
    otherKey: "user_id",
    as: "FavoritedBy",
    onDelete: "CASCADE"
  });

  // 10. Subscription: SubscriptionType, SubscriptionStatus, User
  SubscriptionType.hasMany(Subscription, { foreignKey: "subscription_type_id" });
  Subscription.belongsTo(SubscriptionType, { foreignKey: "subscription_type_id" });

  SubscriptionStatus.hasMany(Subscription, { foreignKey: "subscription_status_id" });
  Subscription.belongsTo(SubscriptionStatus, { foreignKey: "subscription_status_id" });

  User.hasMany(Subscription, { foreignKey: "user_id" });
  Subscription.belongsTo(User, { foreignKey: "user_id" });

  //Report 
  ReportStatus.hasMany(Report, { foreignKey: "report_status_id" });
  Report.belongsTo(ReportStatus, { foreignKey: "report_status_id" });

  User.hasMany(Report, { foreignKey: "user_id" });
  Report.belongsTo(User, { foreignKey: "user_id" });


}