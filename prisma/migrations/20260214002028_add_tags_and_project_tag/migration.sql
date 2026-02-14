-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTag" (
    "projectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProjectTag_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing category values to tags (supports comma-separated)
INSERT INTO "Tag" (id, name, "createdAt")
SELECT gen_random_uuid()::text, t.name, NOW()
FROM (
  SELECT DISTINCT trim(t.name) as name
  FROM "Project" p,
  LATERAL unnest(string_to_array(nullif(trim(p.category), ''), ',')) AS t(name)
  WHERE p.category IS NOT NULL AND trim(p.category) != ''
) t
WHERE t.name != ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO "ProjectTag" ("projectId", "tagId")
SELECT DISTINCT p.id, t.id
FROM "Project" p,
LATERAL unnest(string_to_array(nullif(trim(p.category), ''), ',')) AS cat(name)
JOIN "Tag" t ON t.name = trim(cat.name)
WHERE p.category IS NOT NULL AND trim(p.category) != '' AND trim(cat.name) != '';
