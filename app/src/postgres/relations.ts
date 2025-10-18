import { relations } from "drizzle-orm/relations";
import { workspaces, workspaceMemberships, users } from "./schema";

export const workspaceMembershipsRelations = relations(
  workspaceMemberships,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMemberships.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMemberships.userId],
      references: [users.id],
    }),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  workspaceMemberships: many(workspaceMemberships),
}));

export const usersRelations = relations(users, ({ many }) => ({
  workspaceMemberships: many(workspaceMemberships),
}));
