/*
  Warnings:

  - A unique constraint covering the columns `[rt_hash]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "rt_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_rt_hash_key" ON "user"("rt_hash");
