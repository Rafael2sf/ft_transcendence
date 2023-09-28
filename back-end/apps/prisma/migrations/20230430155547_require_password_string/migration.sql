/*
  Warnings:

  - Made the column `passwd` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "passwd" SET NOT NULL,
ALTER COLUMN "passwd" SET DATA TYPE TEXT;
