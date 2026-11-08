CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"year" smallint NOT NULL,
	"month" smallint NOT NULL,
	"amount_cents" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budget_items_month_ck" CHECK ("budget_items"."month" between 1 and 12),
	CONSTRAINT "budget_items_year_ck" CHECK ("budget_items"."year" between 2000 and 2100),
	CONSTRAINT "budget_items_amount_ck" CHECK ("budget_items"."amount_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "category_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(40) NOT NULL,
	"kind" varchar(10) NOT NULL,
	"result_class" varchar(15),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_groups_kind_ck" CHECK ("category_groups"."kind" in ('RECEITA', 'DESPESA')),
	CONSTRAINT "category_groups_result_class_ck" CHECK (("category_groups"."kind" = 'RECEITA' and "category_groups"."result_class" is null) or ("category_groups"."kind" = 'DESPESA' and "category_groups"."result_class" in ('TRABALHO', 'BASICO', 'INVESTIMENTO')))
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_groups" ADD CONSTRAINT "category_groups_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budget_items_user_category_year_month_uq" ON "budget_items" USING btree ("user_id","category_id","year","month");--> statement-breakpoint
CREATE INDEX "budget_items_user_year_idx" ON "budget_items" USING btree ("user_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "category_groups_user_name_uq" ON "category_groups" USING btree ("user_id","name");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_group_id_category_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."category_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_group_name_uq" ON "categories" USING btree ("group_id","name");--> statement-breakpoint
CREATE INDEX "categories_user_idx" ON "categories" USING btree ("user_id");