/*
  Warnings:

  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "user_picture_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "ladder" SET DEFAULT 0,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "picture" SET DEFAULT 'default';
