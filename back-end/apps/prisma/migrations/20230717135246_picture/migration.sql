/*
  Warnings:

  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlockHist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameHist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlockHist" DROP CONSTRAINT "BlockHist_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "BlockHist" DROP CONSTRAINT "BlockHist_user2_id_fkey";

-- DropForeignKey
ALTER TABLE "GameHist" DROP CONSTRAINT "GameHist_player1_id_fkey";

-- DropForeignKey
ALTER TABLE "GameHist" DROP CONSTRAINT "GameHist_player2_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_achieve_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_user_id_fkey";

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "BlockHist";

-- DropTable
DROP TABLE "GameHist";

-- DropTable
DROP TABLE "UserAchievement";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_user_id_key" ON "Image"("user_id");

-- CreateIndex
CREATE INDEX "Image_user_id_idx" ON "Image"("user_id");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
