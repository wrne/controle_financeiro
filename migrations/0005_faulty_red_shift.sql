ALTER TABLE "accounts" RENAME COLUMN "user" TO "user_id";--> statement-breakpoint
ALTER TABLE "budget" RENAME COLUMN "user" TO "user_id";--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "user" TO "user_id";--> statement-breakpoint
ALTER TABLE "periods" RENAME COLUMN "user" TO "user_id";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "user" TO "user_id";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "budget" DROP CONSTRAINT "budget_user_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "periods" DROP CONSTRAINT "periods_user_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periods" ADD CONSTRAINT "periods_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;