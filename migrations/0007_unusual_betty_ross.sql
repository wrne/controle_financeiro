DROP TABLE "budget" CASCADE;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "type";--> statement-breakpoint
-- Categorias de teste (sem grupo) apagadas com autorização do usuário em 2026-11-07: o próximo passo cria group_id obrigatório.
DELETE FROM "categories";
