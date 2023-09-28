/*
  Warnings:

  - The values [COLOR,TEXTURE] on the enum `GameTexType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameTexType_new" AS ENUM ('color', 'image');
ALTER TABLE "GameUser" ALTER COLUMN "tex_type" TYPE "GameTexType_new" USING ("tex_type"::text::"GameTexType_new");
ALTER TYPE "GameTexType" RENAME TO "GameTexType_old";
ALTER TYPE "GameTexType_new" RENAME TO "GameTexType";
DROP TYPE "GameTexType_old";
COMMIT;
