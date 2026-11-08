CREATE TABLE "budget_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"note" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budget_notes_month_ck" CHECK ("budget_notes"."month" between 1 and 12),
	CONSTRAINT "budget_notes_year_ck" CHECK ("budget_notes"."year" between 2000 and 2100),
	CONSTRAINT "budget_notes_note_ck" CHECK (length(trim("budget_notes"."note")) > 0)
);
--> statement-breakpoint
ALTER TABLE "budget_notes" ADD CONSTRAINT "budget_notes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_notes" ADD CONSTRAINT "budget_notes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budget_notes_user_category_year_month_uq" ON "budget_notes" USING btree ("user_id","category_id","year","month");--> statement-breakpoint
CREATE INDEX "budget_notes_user_year_idx" ON "budget_notes" USING btree ("user_id","year");