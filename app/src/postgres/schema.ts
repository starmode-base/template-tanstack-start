/**
 * Postgres schema
 *
 * NOTE: It is important to make shared field helpers function as they are
 * mutated by the ORM (particularly the inferred field name).
 *
 * In other words, you can't use the same helper for two different fields in
 * the same table unless the helper is a function.
 *
 * Eg. bad:
 * ```ts
 * const decimal2 = numeric({ scale: 2, precision: 18, mode: "number" });
 * ```
 *
 * Good:
 * ```ts
 * const decimal2 = () => numeric({ scale: 2, precision: 18, mode: "number" });
 * ```
 */
import {
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Primary key
 */
const idField = () =>
  text()
    .primaryKey()
    .default(sql`gen_secure_token()`);

/** Created at */
const createdAtField = () =>
  timestamp({ mode: "string" }).defaultNow().notNull();

/** Updated at */
const updatedAtField = () =>
  timestamp({ mode: "string" }).defaultNow().notNull();

/** Decimal type with 2 decimal places */
export const decimal2 = () =>
  numeric({ scale: 2, precision: 18, mode: "number" });

/** Base schema for most tables */
const baseSchema = {
  id: idField(),
  createdAt: createdAtField(),
  updatedAt: updatedAtField(),
};

/**
 * Member role enum
 */
export const memberRole = pgEnum("member_role", [
  /** Organization administrator */
  "ADMINISTRATOR",
  /** Organization member */
  "MEMBER",
]);
export type MemberRole = (typeof memberRole.enumValues)[number];

/**
 * Users table
 */
export const users = pgTable("users", {
  ...baseSchema,
  email: text().notNull(),
  clerkUserId: text().notNull().unique(),
});
export type UserRecord = typeof users.$inferSelect;

/**
 * Organizations table
 */
export const organizations = pgTable("organizations", {
  ...baseSchema,
  name: text().notNull(),
});
export type OrganizationRecord = typeof organizations.$inferSelect;

/**
 * Organization memberships junction table
 */
export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAtField(),
    updatedAt: updatedAtField(),
    role: memberRole().notNull(),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.userId] })],
);
export type OrganizationMembershipRecord =
  typeof organizationMemberships.$inferSelect;
