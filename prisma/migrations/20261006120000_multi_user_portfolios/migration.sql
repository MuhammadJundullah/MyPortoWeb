ALTER TABLE "Users"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "photo" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "instagram" TEXT,
  ADD COLUMN "twitter" TEXT,
  ADD COLUMN "linkedin" TEXT,
  ADD COLUMN "github" TEXT,
  ADD COLUMN "upwork" TEXT;

CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

ALTER TABLE "Projects" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "Certificates" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "Educations" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "Experiences" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "TechStack" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "About" ADD COLUMN "owner_id" INTEGER;

-- Keep accounts created during the first registration rollout.
DO $$
DECLARE
  account_row RECORD;
  project_row JSONB;
  account_user_id INTEGER;
BEGIN
  IF to_regclass('public.portfolio_accounts') IS NOT NULL THEN
    FOR account_row IN EXECUTE 'SELECT username, email, password_hash, portfolio FROM public.portfolio_accounts' LOOP
      INSERT INTO "Users" ("username", "email", "password", "name")
      VALUES (account_row.username, account_row.email, account_row.password_hash, COALESCE(account_row.portfolio->>'name', account_row.username))
      ON CONFLICT ("username") DO NOTHING;

      SELECT "id" INTO account_user_id FROM "Users" WHERE "username" = account_row.username;
      UPDATE "Users" SET "email" = COALESCE("email", account_row.email), "name" = COALESCE("name", account_row.portfolio->>'name') WHERE "id" = account_user_id;

      INSERT INTO "About" ("about", "what_i_do", "role", "owner_id")
      VALUES (COALESCE(account_row.portfolio->>'bio', ''), '', COALESCE(account_row.portfolio->>'role', ''), account_user_id)
      ON CONFLICT ("owner_id") DO NOTHING;

      FOR project_row IN SELECT jsonb_array_elements(
        CASE WHEN jsonb_typeof(account_row.portfolio->'projects') = 'array'
          THEN account_row.portfolio->'projects' ELSE '[]'::jsonb END
      ) LOOP
        INSERT INTO "Projects" ("id", "judul", "category", "url", "tech", "desc", "status", "owner_id")
        VALUES (
          md5(random()::text || clock_timestamp()::text)::uuid::text,
          COALESCE(project_row->>'title', 'Project'),
          'Web Development',
          NULLIF(project_row->>'url', ''),
          NULLIF(project_row->>'tech', ''),
          NULLIF(project_row->>'description', ''),
          'published',
          account_user_id
        );
      END LOOP;
    END LOOP;
  END IF;
END $$;

DO $$
DECLARE
  default_owner INTEGER;
BEGIN
  SELECT MIN("id") INTO default_owner FROM "Users";
  IF default_owner IS NOT NULL THEN
    UPDATE "Users"
      SET "name" = COALESCE("name", 'Sayid Muhammad Jundullah'),
          "email" = COALESCE("email", 'sayidmuhammad15@gmail.com'),
          "phone" = COALESCE("phone", '628385329175'),
          "photo" = COALESCE("photo", '/static-image/IMG_3515.jpeg'),
          "instagram" = COALESCE("instagram", 'saed.m_'),
          "twitter" = COALESCE("twitter", 'MuhammadJndllh'),
          "linkedin" = COALESCE("linkedin", 'https://linkedin.com/in/sayidm'),
          "github" = COALESCE("github", 'https://github.com/MuhammadJundullah'),
          "upwork" = COALESCE("upwork", 'https://www.upwork.com/freelancers/~018c1b59238a7ea8f7')
      WHERE "id" = default_owner;
    UPDATE "Projects" SET "owner_id" = default_owner WHERE "owner_id" IS NULL;
    UPDATE "Certificates" SET "owner_id" = default_owner WHERE "owner_id" IS NULL;
    UPDATE "Educations" SET "owner_id" = default_owner WHERE "owner_id" IS NULL;
    UPDATE "Experiences" SET "owner_id" = default_owner WHERE "owner_id" IS NULL;
    UPDATE "TechStack" SET "owner_id" = default_owner WHERE "owner_id" IS NULL;
    UPDATE "About" SET "owner_id" = default_owner
      WHERE "owner_id" IS NULL AND "id" = (SELECT MIN("id") FROM "About");
  END IF;
END $$;

CREATE UNIQUE INDEX "About_owner_id_key" ON "About"("owner_id");
CREATE INDEX "Projects_owner_id_idx" ON "Projects"("owner_id");
CREATE INDEX "Certificates_owner_id_idx" ON "Certificates"("owner_id");
CREATE INDEX "Educations_owner_id_idx" ON "Educations"("owner_id");
CREATE INDEX "Experiences_owner_id_idx" ON "Experiences"("owner_id");
CREATE INDEX "TechStack_owner_id_idx" ON "TechStack"("owner_id");

ALTER TABLE "Projects" ADD CONSTRAINT "Projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Educations" ADD CONSTRAINT "Educations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Experiences" ADD CONSTRAINT "Experiences_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TechStack" ADD CONSTRAINT "TechStack_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "About" ADD CONSTRAINT "About_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
