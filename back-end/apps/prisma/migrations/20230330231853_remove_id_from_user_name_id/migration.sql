/*
  Warnings:

  - You are about to drop the column `name_id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_name_id_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "name_id",
ADD COLUMN     "name" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");
