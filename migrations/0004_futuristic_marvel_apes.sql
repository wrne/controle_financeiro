ALTER TABLE "accounts" ADD COLUMN "user" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "budget" ADD COLUMN "user" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "user" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "periods" ADD COLUMN "user" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "user" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_Users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_Users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_Users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periods" ADD CONSTRAINT "periods_user_Users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_Users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;