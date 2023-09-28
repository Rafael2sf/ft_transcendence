/*
  Warnings:

  - You are about to drop the column `picture_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `picture` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[picture]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "picture" DROP CONSTRAINT "picture_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "picture_id",
ADD COLUMN     "picture" TEXT;

-- DropTable
DROP TABLE "picture";

-- CreateIndex
CREATE UNIQUE INDEX "user_picture_key" ON "user"("picture");
