/**
 * Postgres Drizzle ORM schema
 *
 * Instructions: .cursor/rules/drizzle.mdc
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
  boolean,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Primary key */
const primaryKeyField = () =>
  text()
    .primaryKey()
    .default(sql`gen_secure_token()`);

/** Timestamp with default NOW() */
const timestampField = () =>
  timestamp({ mode: "string" }).defaultNow().notNull();

/** Decimal type with 2 decimal places */
export const decimal2Field = () =>
  numeric({ scale: 2, precision: 18, mode: "number" });

/** Base schema for most tables */
const baseSchema = {
  id: primaryKeyField(),
  createdAt: timestampField(),
  updatedAt: timestampField(),
};

/**
 * Workspace member role enum
 */
export const workspaceMemberRole = pgEnum("workspace_member_role", [
  /** Workspace administrator */
  "administrator",
  /** Workspace member */
  "member",
]);

export type WorkspaceMemberRole =
  (typeof workspaceMemberRole.enumValues)[number];

/**
 * Users table
 */
export const users = pgTable("users", {
  ...baseSchema,
  /**
   * User email address copied from Clerk's primary email
   *
   * Intentionally not unique in this table because Clerk enforces uniqueness
   * and emails can change. Cached here for display and convenience.
   */
  email: text().notNull(),
  /** Stable unique user identifier from Clerk */
  clerkUserId: text().notNull().unique(),
  isSuperuser: boolean().notNull().default(false),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

/**
 * Workspaces table
 */
export const workspaces = pgTable("workspaces", {
  ...baseSchema,
  name: text().notNull(),
});

export type WorkspaceSelect = typeof workspaces.$inferSelect;
export type WorkspaceInsert = typeof workspaces.$inferInsert;

/**
 * Workspace memberships junction table
 *
 * Enables many-to-many relationships between workspaces and users
 */
export const workspaceMemberships = pgTable(
  "workspace_memberships",
  {
    workspaceId: text()
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestampField(),
    updatedAt: timestampField(),
    role: workspaceMemberRole().notNull(),
  },
  (t) => [
    // Enforce: a user can only be a member of a workspace once
    primaryKey({ columns: [t.workspaceId, t.userId] }),
  ],
);

export type WorkspaceMembershipSelect =
  typeof workspaceMemberships.$inferSelect;
export type WorkspaceMembershipInsert =
  typeof workspaceMemberships.$inferInsert;
