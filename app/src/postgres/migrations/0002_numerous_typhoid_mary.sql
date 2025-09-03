ALTER TYPE "public"."member_role" RENAME TO "workspace_member_role";--> statement-breakpoint
ALTER TABLE "organization_memberships" RENAME TO "workspace_memberships";--> statement-breakpoint
ALTER TABLE "organizations" RENAME TO "workspaces";--> statement-breakpoint
ALTER TABLE "workspace_memberships" RENAME COLUMN "organization_id" TO "workspace_id";--> statement-breakpoint
ALTER TABLE "workspace_memberships" DROP CONSTRAINT "organization_memberships_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_memberships" DROP CONSTRAINT "organization_memberships_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."workspace_member_role";--> statement-breakpoint
CREATE TYPE "public"."workspace_member_role" AS ENUM('administrator', 'member');--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DATA TYPE "public"."workspace_member_role" USING "role"::"public"."workspace_member_role";--> statement-breakpoint
ALTER TABLE "workspace_memberships" DROP CONSTRAINT "organization_memberships_organization_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id");--> statement-breakpoint
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;