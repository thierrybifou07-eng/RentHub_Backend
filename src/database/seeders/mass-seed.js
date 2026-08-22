/**
 * Mass seed script — démo RentHub
 *
 * Génère ~500 utilisateurs, 5 000 annonces, conversations, messages,
 * favoris, signalements, notifications et audit logs.
 *
 * Usage :  npm run db:mass-seed
 *
 * Prérequis : les seeders de base (roles, cities, etc.) doivent déjà avoir
 * été exécutés au moins une fois via `npm run db:seed`.
 */
import "../setupAssociations.js";
import orm from "../../../config/sequelize_app.js";
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { faker } from "@faker-js/faker";

import User from "../models/user.model.js";
import Announcement from "../models/announcement.model.js";
import Media from "../models/media.model.js";
import MediaType from "../models/media-type.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Favorite from "../models/favorite.model.js";
import Report from "../models/report.model.js";
import Notification from "../models/notification.model.js";
import AuditLog from "../models/audit-log.model.js";
import Session from "../models/session.model.js";
import City from "../models/city.model.js";
import PropertyType from "../models/property-type.model.js";
import UserStatus from "../models/user-status.model.js";

import bcrypt from "bcrypt";
import { ROLE_IDS, ROLE_NAMES, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "../../../config/auth/app.js";

/* ─── Constants ────────────────────────────────────────────────── */
const BATCH = 500;
const IMAGES_SRC = "C:\\Users\\thier\\Pictures\\houses";
const IMAGES_DEST_DIR = resolve("public", "uploads", "ANNOUNCEMENT_IMAGE");
const UPLOADS_PATH = "public/uploads/ANNOUNCEMENT_IMAGE";
const SEED_PASSWORD = "User@12345";

/* Scale down factor: divide large seed counts by this value */
const SCALE_DIVISOR = 100;

/* Derived smaller counts */
const RANDOM_USERS = Math.max(1, Math.floor(495 / SCALE_DIVISOR));
const ANNOUNCEMENTS_COUNT = Math.max(1, Math.floor(5000 / SCALE_DIVISOR));
const CONVERSATIONS_TARGET = Math.max(1, Math.floor(500 / SCALE_DIVISOR));
const FAVORITES_TARGET = Math.max(1, Math.floor(3000 / SCALE_DIVISOR));
const REPORTS_COUNT = Math.max(1, Math.floor(200 / SCALE_DIVISOR));
const NOTIFICATIONS_COUNT = Math.max(1, Math.floor(1000 / SCALE_DIVISOR));
const AUDIT_COUNT = Math.max(1, Math.floor(500 / SCALE_DIVISOR));

const ADJECTIFS = [
  "Moderne", "Chaleureux", "Spacieux", "Lumineux", "Cosy", "Renove",
  "Fonctionnel", "Agreable", "Elegant", "Calme", "Pratique", "Raffine",
  "Seduissant", "Authentique", "Aere",
];

const CONVO_MSGS = [
  "Bonjour, est-ce que l'annonce est toujours disponible ?",
  "Oui, bien sur ! Vous souhaitez visiter ?",
  "C'est possible demain apres-midi ?",
  "Bien, je vous propose a 14h. Ca vous convient ?",
  "Parfait, a demain alors !",
  "La caution est de combien ?",
  "La caution correspond a un mois de loyer.",
  "D'accord, et les charges sont incluses ?",
  "Les charges sont comprises dans le loyer.",
  "Super, je suis tres interesse(e).",
  "Le quartier est-il sur ?",
  "Oui, c'est un quartier tranquille et bien desservi.",
  "Pouvez-vous m'envoyer plus de photos ?",
  "Bien sur, je vous envoie ca ce soir.",
  "Le loyer est-il negociable ?",
  "Je peux accorder une reduction de 5% pour un bail de 2 ans.",
  "Quelle est la superficie exacte ?",
  "C'est dans l'annonce : 85m2.",
  "Le logement est-il meuble ?",
  "Non, mais je peux fournir les meubles de base.",
  "Merci pour vos reponses, je reviens vers vous bientot.",
  "N'hesitez pas si vous avez d'autres questions !",
  "Bonsoir, je voudrais savoir si le bail est encore disponible.",
  "Oui, il est disponible. Vous voulez plus de details ?",
];

const REPORT_REASONS = [
  "Prix manifestement trop eleve pour le quartier",
  "Photos qui ne correspondent pas a la realite",
  "Description trompeuse sur l'etat du bien",
  "Annonce publiee plusieurs fois",
  "Logement deja loue mais toujours affiche",
  "Informations de contact inexistantes",
  "Annonce discriminatoire",
  "Photos volues sur internet",
  "Logement non conforme aux normes de securite",
  "Annonce datant de plus de 6 mois non mise a jour",
];

/* ─── Helpers ──────────────────────────────────────────────────── */
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (s, e) => new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()));
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function weightedPick(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item.id; }
  return items[items.length - 1].id;
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 0 — Copy house images
   ═══════════════════════════════════════════════════════════════════ */
function copyHouseImages() {
  console.log("[0/9] Copying house images...");
  const files = readdirSync(IMAGES_SRC).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  for (const file of files) {
    try { copyFileSync(resolve(IMAGES_SRC, file), resolve(IMAGES_DEST_DIR, file)); } catch {}
  }
  console.log(`      ${files.length} images copied.`);
  return files;
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 1 — Cleanup (FK order)
   ═══════════════════════════════════════════════════════════════════ */
async function cleanup() {
  console.log("[1/9] Cleaning existing data...");
  await orm.query("SET FOREIGN_KEY_CHECKS = 0");
  const tables = [
    "notifications", "messages", "conversations", "reports",
    "favorites", "media", "audit_logs", "sessions",
    "announcements", "users",
  ];
  for (const t of tables) await orm.query(`TRUNCATE TABLE \`${t}\``);
  await orm.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("      Done.");
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 2 — Users (~505)
   ═══════════════════════════════════════════════════════════════════ */
async function generateUsers() {
  console.log("[2/9] Generating users (scaled down)...");
  const cities = await City.findAll();
  const cityIds = cities.map(c => c.id);
  const stActive = (await UserStatus.findOne({ where: { code: "ACTIVE" } })).id;
  const stSuspended = (await UserStatus.findOne({ where: { code: "SUSPENDED" } })).id;
  const stInactive = (await UserStatus.findOne({ where: { code: "INACTIVE" } })).id;
  const stPending = (await UserStatus.findOne({ where: { code: "PENDING_VERIFICATION" } })).id;

  const statusWeights = [
    { id: stActive, weight: 80 },
    { id: stSuspended, weight: 10 },
    { id: stInactive, weight: 5 },
    { id: stPending, weight: 5 },
  ];

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const users = [];

  /* Deterministic demo accounts */
  const demos = [
    { fn: "Root", ln: "RentHub", email: "root@renthub.com", role: ROLE_IDS.ROOT },
    { fn: "Admin", ln: "RentHub", email: "admin@renthub.com", role: ROLE_IDS.ADMIN },
    { fn: "Jean", ln: "Dupont", email: "jean.dupont@email.com", role: ROLE_IDS.OWNER },
    { fn: "Marie", ln: "Kamga", email: "marie.kamga@email.com", role: ROLE_IDS.TENANT },
    { fn: "Paul", ln: "Nkoulou", email: "paul.nkoulou@email.com", role: ROLE_IDS.OWNER },
    { fn: "Sophie", ln: "Atangana", email: "sophie.atangana@email.com", role: ROLE_IDS.TENANT },
    { fn: "Pierre", ln: "Mbida", email: "pierre.mbida@email.com", role: ROLE_IDS.OWNER },
  ];
  for (const d of demos) {
    const pw = d.email === "root@renthub.com" ? "Root@12345"
      : d.email === "admin@renthub.com" ? "Admin@12345"
      : SEED_PASSWORD;
    users.push({
      firstname: d.fn, lastname: d.ln, email: d.email,
      password: pw,
      phone: `+2376${faker.string.numeric(8)}`,
      gender: d.fn === "Marie" || d.fn === "Sophie" ? "Femme" : "Homme",
      role_id: d.role, user_status_id: stActive,
      city_id: pick(cityIds),
      birth_date: faker.date.birthdate({ min: 25, max: 50, mode: "age" }),
      address: faker.location.streetAddress(),
      email_verified_at: now, verified_at: now, accepted_terms_at: now,
      createdAt: randomDate(yearAgo, now),
    });
  }

  /* 495 random users (scaled) */
  for (let i = 0; i < RANDOM_USERS; i++) {
    const g = faker.person.sexType();
    const createdAt = randomDate(yearAgo, now);
    users.push({
      firstname: faker.person.firstName(g),
      lastname: faker.person.lastName(g),
      email: faker.internet.email().toLowerCase(),
      password: SEED_PASSWORD,
      phone: `+2376${faker.string.numeric(8)}`,
      gender: g === "male" ? "Homme" : "Femme",
      birth_date: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
      role_id: Math.random() < 0.7 ? ROLE_IDS.OWNER : ROLE_IDS.TENANT,
      user_status_id: weightedPick(statusWeights),
      city_id: pick(cityIds),
      address: faker.location.streetAddress(),
      email_verified_at: Math.random() < 0.95 ? now : null,
      verified_at: Math.random() < 0.3 ? now : null,
      accepted_terms_at: now,
      last_login_at: Math.random() < 0.6 ? randomDate(createdAt, now) : null,
      createdAt,
    });
  }

  const hashCache = {};
  async function hashPw(pw) {
    if (!hashCache[pw]) hashCache[pw] = await bcrypt.hash(pw, 10);
    return hashCache[pw];
  }
  for (const u of users) u.password = await hashPw(u.password);

  for (const batch of chunk(users, BATCH)) {
    await User.bulkCreate(batch);
  }
  const all = await User.findAll();
  console.log(`      ${all.length} users created.`);
  return all;
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 3 — Announcements (5000)
   ═══════════════════════════════════════════════════════════════════ */
async function generateAnnouncements(allUsers) {
  console.log(`[3/9] Generating ${ANNOUNCEMENTS_COUNT} announcements...`);
  const cities = await City.findAll();
  const cityMap = {};
  const cIds = [];
  cities.forEach(c => { cityMap[c.id] = c.name; cIds.push(c.id); });
  const ptypes = await PropertyType.findAll();
  const ptMap = {};
  ptypes.forEach(p => { ptMap[p.id] = p.label; });
  const ptIds = ptypes.map(p => p.id);

  const activeOwnerIds = allUsers
    .filter(u => u.role_id === ROLE_IDS.OWNER && u.user_status_id === 1)
    .map(u => u.id);

  const now = new Date();
  const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  function pickStatus() {
    const r = Math.random() * 100;
    if (r < 85) return 1;
    if (r < 90) return 2;
    if (r < 93) return 3;
    if (r < 97) return 4;
    return 5;
  }

  const rows = [];
  for (let i = 0; i < ANNOUNCEMENTS_COUNT; i++) {
    const ptId = pick(ptIds);
    const cId = pick(cIds);
    const rooms = randInt(1, 6);
    const bedrooms = randInt(1, rooms);
    let minP = 15000, maxP = 200000;
    if (ptId === 6 || ptId === 3) { minP = 50000; maxP = 350000; }
    if (ptId === 2) { minP = 10000; maxP = 80000; }
    if ([5, 8, 9].includes(ptId)) { minP = 30000; maxP = 300000; }
    const ca = randomDate(yearAgo, now);
    rows.push({
      title: `${pick(ADJECTIFS)} ${ptMap[ptId].toLowerCase()} a ${cityMap[cId]}`,
      description: faker.lorem.paragraphs(randInt(2, 5)),
      price: faker.number.float({ min: minP, max: maxP, multipleOf: 100 }),
      surface_area: faker.number.float({ min: 16, max: 300, multipleOf: 5 }),
      rooms, bedrooms, bathrooms: randInt(1, Math.max(bedrooms, 2)),
      furnished: Math.random() < 0.35,
      property_type_id: ptId, city_id: cId,
      user_id: pick(activeOwnerIds),
      status_id: pickStatus(),
      createdAt: ca, updatedAt: ca,
    });
  }

  for (const batch of chunk(rows, 1000)) await Announcement.bulkCreate(batch);
  console.log(`      ${rows.length} announcements created.`);

  return rows;
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 4 — Media (~12000)
   ═══════════════════════════════════════════════════════════════════ */
async function generateMedia(imageFiles) {
  console.log("[4/9] Generating media...");
  const imgType = await MediaType.findOne({ where: { code: "ANNOUNCEMENT_IMAGE" } });
  const anns = await Announcement.findAll({ attributes: ["id", "createdAt"] });
  const items = [];

  for (const ann of anns) {
    const n = randInt(1, 3);
    for (let m = 0; m < n; m++) {
      const f = pick(imageFiles);
      let sz;
      try { sz = statSync(resolve(IMAGES_SRC, f)).size; } catch { sz = 10000; }
      items.push({
        media_type_id: imgType.id,
        url: `${UPLOADS_PATH}/${f}`, filename: f,
        mime_type: "image/jpeg", file_size: sz,
        is_primary: m === 0,
        mediable_id: ann.id, mediable_type: "Announcement",
        createdAt: ann.createdAt, updatedAt: ann.createdAt,
      });
    }
  }

  for (const batch of chunk(items, 2000)) await Media.bulkCreate(batch);
  console.log(`      ${items.length} media items created (scaled announcements).`);
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 5 — Conversations + Messages (~500 convs, ~2500 msgs)
   ═══════════════════════════════════════════════════════════════════ */
async function generateConversations(allUsers) {
  console.log("[5/9] Generating conversations...");
  const tenants = allUsers.filter(u => u.role_id === ROLE_IDS.TENANT && u.user_status_id === 1);
  const tenantIds = tenants.map(u => u.id);
  const activeAnns = await Announcement.findAll({
    where: { status_id: 1 },
    attributes: ["id", "user_id"],
  });
  if (!tenantIds.length || !activeAnns.length) {
    console.log("      Skipped (no data).");
    return;
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const usedPairs = new Set();
  const convs = [];
  const msgs = [];
  const target = Math.min(CONVERSATIONS_TARGET, activeAnns.length * tenantIds.length);

  while (convs.length < target && usedPairs.size < tenantIds.length * activeAnns.length) {
    const ann = pick(activeAnns);
    const tid = pick(tenantIds);
    const key = `${tid}-${ann.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);

    const convDate = randomDate(sixMonthsAgo, now);
    const numMsgs = randInt(2, 8);
    let lastContent = "";
    const convMsgs = [];

    for (let m = 0; m < numMsgs; m++) {
      const sender = m % 2 === 0 ? tid : ann.user_id;
      const content = pick(CONVO_MSGS);
      const msgDate = new Date(convDate.getTime() + m * randInt(60000, 7200000));
      convMsgs.push({ sender_id: sender, content, _date: msgDate });
      lastContent = content;
    }

    convs.push({
      announcement_id: ann.id, tenant_id: tid, owner_id: ann.user_id,
      last_message: lastContent,
      createdAt: convDate, updatedAt: convDate,
    });
  }

  const createdConvs = await Conversation.bulkCreate(convs, { returning: true });
  console.log(`      ${createdConvs.length} conversations created (scaled).`);

  console.log("[6/9] Generating messages...");
  const msgRows = [];
  for (let ci = 0; ci < createdConvs.length; ci++) {
    const conv = createdConvs[ci];
    const numMsgs = randInt(2, 8);
    for (let m = 0; m < numMsgs; m++) {
      const sender = m % 2 === 0 ? conv.tenant_id : conv.owner_id;
      const content = pick(CONVO_MSGS);
      const offset = m * randInt(60000, 7200000);
      const msgDate = new Date(conv.createdAt.getTime() + offset);
      const isRead = m < numMsgs - 1 || Math.random() < 0.8;
      msgRows.push({
        conversation_id: conv.id, sender_id: sender,
        content, read_at: isRead ? randomDate(msgDate, new Date(msgDate.getTime() + 86400000)) : null,
        createdAt: msgDate, updatedAt: msgDate,
      });
    }
  }
  for (const batch of chunk(msgRows, 2000)) await Message.bulkCreate(batch);
  console.log(`      ${msgRows.length} messages created.`);
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 7 — Favorites (~3000)
   ═══════════════════════════════════════════════════════════════════ */
async function generateFavorites(allUsers) {
  console.log("[7/9] Generating favorites...");
  const tenants = allUsers.filter(u => u.role_id === ROLE_IDS.TENANT && u.user_status_id === 1);
  const activeAnns = await Announcement.findAll({ where: { status_id: 1 }, attributes: ["id"] });
  if (!tenants.length || !activeAnns.length) { console.log("      Skipped."); return; }

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const favs = [];
  const usedPairs = new Set();

  while (favs.length < FAVORITES_TARGET && usedPairs.size < tenants.length * activeAnns.length) {
    const tid = pick(tenants).id;
    const aid = pick(activeAnns).id;
    const key = `${tid}-${aid}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);
    const ca = randomDate(sixMonthsAgo, now);
    favs.push({ user_id: tid, announcement_id: aid, createdAt: ca });
  }

  for (const batch of chunk(favs, 2000)) await Favorite.bulkCreate(batch);
  console.log(`      ${favs.length} favorites created (scaled).`);
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 8 — Reports (~200)
   ═══════════════════════════════════════════════════════════════════ */
async function generateReports(allUsers) {
  console.log("[8/9] Generating reports...");
  const tenants = allUsers.filter(u => u.role_id === ROLE_IDS.TENANT && u.user_status_id === 1);
  const anns = await Announcement.findAll({ attributes: ["id"] });
  if (!tenants.length || !anns.length) { console.log("      Skipped."); return; }

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const admins = allUsers.filter(u => u.role_id === ROLE_IDS.ADMIN || u.role_id === ROLE_IDS.ROOT);
  const reports = [];

  for (let i = 0; i < REPORTS_COUNT; i++) {
    const statusRoll = Math.random() * 100;
    let statusId = 1;
    if (statusRoll > 60) statusId = 2;
    if (statusRoll > 80) statusId = 3;
    if (statusRoll > 90) statusId = 4;

    const ca = randomDate(sixMonthsAgo, now);
    reports.push({
      announcement_id: pick(anns).id,
      reporter_id: pick(tenants).id,
      reason: pick(REPORT_REASONS),
      status_id: statusId,
      admin_id: statusId > 1 ? (admins.length ? pick(admins).id : null) : null,
      admin_note: statusId > 1 ? faker.lorem.sentence() : null,
      createdAt: ca, updatedAt: ca,
    });
  }

  for (const batch of chunk(reports, 500)) await Report.bulkCreate(batch);
  console.log(`      ${reports.length} reports created (scaled).`);
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 9 — Notifications (~1000) + Audit Logs (~500)
   ═══════════════════════════════════════════════════════════════════ */
async function generateNotifications(allUsers) {
  console.log("[9/9] Generating notifications + audit logs...");
  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const anns = await Announcement.findAll({ attributes: ["id", "title"] });

  /* ── Notifications ── */
  const types = [
    { type: "new_message", title: "Nouveau message", body: "Vous avez recu un nouveau message." },
    { type: "announcement_approved", title: "Annonce approuvee", body: "Votre annonce a ete approuvee." },
    { type: "announcement_rejected", title: "Annonce rejetee", body: "Votre annonce n'a pas ete retenue." },
    { type: "new_report", title: "Nouveau signalement", body: "Un signalement a ete depose." },
    { type: "report_reviewed", title: "Signalement examine", body: "Votre signalement est en cours de traitement." },
  ];

  const notifRows = [];
  for (let i = 0; i < NOTIFICATIONS_COUNT; i++) {
    const t = pick(types);
    const ca = randomDate(sixMonthsAgo, now);
    const isRead = Math.random() < 0.7;
    notifRows.push({
      user_id: pick(allUsers).id,
      actor_id: pick(allUsers).id,
      type: t.type, title: t.title, body: t.body,
      data: anns.length ? { announcementId: pick(anns).id } : null,
      is_read: isRead,
      read_at: isRead ? randomDate(ca, new Date(ca.getTime() + 86400000 * 7)) : null,
      createdAt: ca,
    });
  }
  for (const batch of chunk(notifRows, 2000)) await Notification.bulkCreate(batch);
  console.log(`      ${notifRows.length} notifications created (scaled).`);

  /* ── Audit Logs ── */
  const actions = [
    AUDIT_ACTIONS.ROLE_CHANGE, AUDIT_ACTIONS.STATUS_CHANGE,
    AUDIT_ACTIONS.PASSWORD_RESET, AUDIT_ACTIONS.ACCOUNT_VERIFY,
    AUDIT_ACTIONS.ANNOUNCEMENT_MODERATE, AUDIT_ACTIONS.LOGIN,
  ];
  const targets = [AUDIT_TARGET_TYPES.USER, AUDIT_TARGET_TYPES.ANNOUNCEMENT, AUDIT_TARGET_TYPES.SUBSCRIPTION, AUDIT_TARGET_TYPES.REPORT];

  const auditRows = [];
  for (let i = 0; i < AUDIT_COUNT; i++) {
    const actor = pick(allUsers);
    const action = pick(actions);
    const ca = randomDate(sixMonthsAgo, now);
    auditRows.push({
      actor_id: actor.id, actor_email: actor.email,
      actor_role: ROLE_NAMES[actor.role_id] || "UNKNOWN",
      action, target_type: pick(targets),
      target_id: randInt(1, Math.max(anns.length, 20)),
      old_values: action === AUDIT_ACTIONS.ROLE_CHANGE
        ? { role_id: randInt(1, 5) }
        : action === AUDIT_ACTIONS.STATUS_CHANGE ? { user_status_id: 1 } : null,
      new_values: action === AUDIT_ACTIONS.ROLE_CHANGE
        ? { role_id: randInt(1, 5) }
        : action === AUDIT_ACTIONS.STATUS_CHANGE ? { user_status_id: 3 }
        : action === AUDIT_ACTIONS.PASSWORD_RESET ? { reset_by: "root" } : null,
      ip_address: `192.168.1.${randInt(1, 254)}`,
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      createdAt: ca,
    });
  }
  for (const batch of chunk(auditRows, 500)) await AuditLog.bulkCreate(batch);
  console.log(`      ${auditRows.length} audit logs created (scaled).`);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */
async function main() {
  const t0 = Date.now();
  console.log("=== RentHub Mass Seed ===\n");

  await orm.authenticate();
  console.log("Database connected.\n");

  const imageFiles = copyHouseImages();
  await cleanup();
  const allUsers = await generateUsers();
  await generateAnnouncements(allUsers);
  await generateMedia(imageFiles);
  await generateConversations(allUsers);
  await generateFavorites(allUsers);
  await generateReports(allUsers);
  await generateNotifications(allUsers);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n=== Mass seed completed in ${elapsed}s ===`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Mass seed failed:", err);
  process.exit(1);
});
