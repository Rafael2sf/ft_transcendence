/*
  Warnings:

  - A unique constraint covering the columns `[intraname]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `intraname` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "intraname" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_intraname_key" ON "user"("intraname");

-- TODO: new migration manually with tables names as uppercase