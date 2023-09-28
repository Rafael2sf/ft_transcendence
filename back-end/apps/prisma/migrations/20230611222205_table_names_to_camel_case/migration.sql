/*
  Warnings:

  - You are about to drop the `achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `block_hist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_hist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_achievement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMessage" DROP CONSTRAINT "ChannelMessage_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Direct" DROP CONSTRAINT "Direct_target_id_fkey";

-- DropForeignKey
ALTER TABLE "Direct" DROP CONSTRAINT "Direct_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserChannel" DROP CONSTRAINT "UserChannel_user_id_fkey";

-- DropForeignKey
ALTER TABLE "block_hist" DROP CONSTRAINT "block_hist_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "block_hist" DROP CONSTRAINT "block_hist_user2_id_fkey";

-- DropForeignKey
ALTER TABLE "game_hist" DROP CONSTRAINT "game_hist_player1_id_fkey";

-- DropForeignKey
ALTER TABLE "game_hist" DROP CONSTRAINT "game_hist_player2_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievement" DROP CONSTRAINT "user_achievement_achieve_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievement" DROP CONSTRAINT "user_achievement_user_id_fkey";

-- DropTable
DROP TABLE "achievement";

-- DropTable
DROP TABLE "block_hist";

-- DropTable
DROP TABLE "game_hist";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_achievement";

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(100),

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockHist" (
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,

    CONSTRAINT "BlockHist_pkey" PRIMARY KEY ("user1_id","user2_id")
);

-- CreateTable
CREATE TABLE "GameHist" (
    "id" SERIAL NOT NULL,
    "player1_id" INTEGER NOT NULL,
    "player2_id" INTEGER NOT NULL,
    "score1" SMALLINT NOT NULL DEFAULT 0,
    "score2" SMALLINT NOT NULL DEFAULT 0,
    "sttm" TIMESTAMP(6) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,
    "ettm" TIMESTAMP(6) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,

    CONSTRAINT "GameHist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "status" "UserState" DEFAULT 'ONLINE',
    "ladder" INTEGER DEFAULT 0,
    "name" VARCHAR(30) NOT NULL,
    "intraname" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "picture" TEXT DEFAULT 'default',
    "rt_hash" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "user_id" INTEGER NOT NULL,
    "achieve_id" INTEGER NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("user_id","achieve_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_description_key" ON "Achievement"("description");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_intraname_key" ON "User"("intraname");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannel" ADD CONSTRAINT "UserChannel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direct" ADD CONSTRAINT "Direct_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direct" ADD CONSTRAINT "Direct_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockHist" ADD CONSTRAINT "BlockHist_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BlockHist" ADD CONSTRAINT "BlockHist_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GameHist" ADD CONSTRAINT "GameHist_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GameHist" ADD CONSTRAINT "GameHist_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achieve_id_fkey" FOREIGN KEY ("achieve_id") REFERENCES "Achievement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
