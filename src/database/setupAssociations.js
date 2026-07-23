import {
  Amenity,
  Announcement,
  AnnouncementStatus,
  AnnouncementType,
  Booking,
  BookingStatus,
  Chat,
  City,
  Country,
  Department,
  Favorite,
  Media,
  MediaType,
  Message,
  MessageStatus,
  Property,
  PropertyAmenity,
  PropertyStatus,
  PropertyType,
  Report,
  ReportStatus,
  Role,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  User,
  UserChat,
  UserStatus,
} from "./models/index.js";

const setupAssociations = () => {
  Department.hasMany(City, { foreignKey: "department_id" });
  City.belongsTo(Department, { foreignKey: "department_id" });

  City.hasMany(Property, { foreignKey: "city_id" });
  Property.belongsTo(City, { foreignKey: "city_id" });

  PropertyType.hasMany(Property, { foreignKey: "property_type_id" });
  Property.belongsTo(PropertyType, { foreignKey: "property_type_id" });

  PropertyStatus.hasMany(Property, { foreignKey: "property_status_id" });
  Property.belongsTo(PropertyStatus, { foreignKey: "property_status_id" });

  Role.hasMany(User, { foreignKey: "role_id" });
  User.belongsTo(Role, { foreignKey: "role_id" });

  UserStatus.hasMany(User, { foreignKey: "user_status_id" });
  User.belongsTo(UserStatus, { foreignKey: "user_status_id" });

  City.hasMany(User, { foreignKey: "city_id" });
  User.belongsTo(City, { foreignKey: "city_id" });

  User.hasMany(Property, { foreignKey: "owner_id" });
  Property.belongsTo(User, { as: "Owner", foreignKey: "owner_id" });

  Property.hasMany(Announcement, { foreignKey: "property_id" });
  Announcement.belongsTo(Property, { foreignKey: "property_id" });

  AnnouncementType.hasMany(Announcement, { foreignKey: "announcement_type_id" });
  Announcement.belongsTo(AnnouncementType, { foreignKey: "announcement_type_id" });

  AnnouncementStatus.hasMany(Announcement, { foreignKey: "announcement_status_id" });
  Announcement.belongsTo(AnnouncementStatus, { foreignKey: "announcement_status_id" });

  User.hasMany(Announcement, { foreignKey: "lister_id" });
  Announcement.belongsTo(User, { as: "Lister", foreignKey: "lister_id" });

  BookingStatus.hasMany(Booking, { foreignKey: "booking_status_id" });
  Booking.belongsTo(BookingStatus, { foreignKey: "booking_status_id" });

  User.hasMany(Booking, { foreignKey: "tenant_id" });
  Booking.belongsTo(User, { as: "Tenant", foreignKey: "tenant_id" });

  Property.hasMany(Booking, { foreignKey: "property_id" });
  Booking.belongsTo(Property, { foreignKey: "property_id" });

  Favorite.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(Favorite, { foreignKey: "user_id" });

  Favorite.belongsTo(Property, { foreignKey: "property_id" });
  Property.hasMany(Favorite, { foreignKey: "property_id" });

  MediaType.hasMany(Media, { foreignKey: "media_type_id" });
  Media.belongsTo(MediaType, { foreignKey: "media_type_id" });

  Property.hasMany(Media, { foreignKey: "property_id" });
  Media.belongsTo(Property, { foreignKey: "property_id" });

  User.hasMany(Media, { foreignKey: "user_id" });
  Media.belongsTo(User, { foreignKey: "user_id" });

  MessageStatus.hasMany(Message, { foreignKey: "message_status_id" });
  Message.belongsTo(MessageStatus, { foreignKey: "message_status_id" });

  Chat.hasMany(Message, { foreignKey: "chat_id" });
  Message.belongsTo(Chat, { foreignKey: "chat_id" });

  User.hasMany(Message, { foreignKey: "sender_id" });
  Message.belongsTo(User, { as: "Sender", foreignKey: "sender_id" });

  Property.belongsToMany(Amenity, {
    through: PropertyAmenity,
    foreignKey: "property_id",
    otherKey: "amenity_id",
  });
  Amenity.belongsToMany(Property, {
    through: PropertyAmenity,
    foreignKey: "amenity_id",
    otherKey: "property_id",
  });

  PropertyAmenity.belongsTo(Property, { foreignKey: "property_id" });
  PropertyAmenity.belongsTo(Amenity, { foreignKey: "amenity_id" });
  Property.hasMany(PropertyAmenity, { foreignKey: "property_id" });
  Amenity.hasMany(PropertyAmenity, { foreignKey: "amenity_id" });

  ReportStatus.hasMany(Report, { foreignKey: "report_status_id" });
  Report.belongsTo(ReportStatus, { foreignKey: "report_status_id" });

  User.hasMany(Report, { foreignKey: "user_id" });
  Report.belongsTo(User, { foreignKey: "user_id" });

  Property.hasMany(Report, { foreignKey: "property_id" });
  Report.belongsTo(Property, { foreignKey: "property_id" });

  Announcement.hasMany(Report, { foreignKey: "announcement_id" });
  Report.belongsTo(Announcement, { foreignKey: "announcement_id" });

  SubscriptionType.hasMany(Subscription, { foreignKey: "subscription_type_id" });
  Subscription.belongsTo(SubscriptionType, { foreignKey: "subscription_type_id" });

  SubscriptionStatus.hasMany(Subscription, { foreignKey: "subscription_status_id" });
  Subscription.belongsTo(SubscriptionStatus, { foreignKey: "subscription_status_id" });

  User.hasMany(Subscription, { foreignKey: "user_id" });
  Subscription.belongsTo(User, { foreignKey: "user_id" });

  User.belongsToMany(Chat, {
    through: UserChat,
    foreignKey: "user_id",
    otherKey: "chat_id",
  });
  Chat.belongsToMany(User, {
    through: UserChat,
    foreignKey: "chat_id",
    otherKey: "user_id",
  });

  UserChat.belongsTo(User, { foreignKey: "user_id" });
  UserChat.belongsTo(Chat, { foreignKey: "chat_id" });
  User.hasMany(UserChat, { foreignKey: "user_id" });
  Chat.hasMany(UserChat, { foreignKey: "chat_id" });
};

setupAssociations();

export default setupAssociations;
