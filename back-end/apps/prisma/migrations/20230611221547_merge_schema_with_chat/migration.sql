/*
  Warnings:

  - The `status` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ban_hist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_hist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `direct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `direct_hist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('OFFLINE', 'ONLINE', 'IN_GAME');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PUBLIC', 'PROTECTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ChannelRole" AS ENUM ('BANNED', 'NONE', 'USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "DirectState" AS ENUM ('BLOCKED', 'NONE', 'FRIEND');

-- DropForeignKey
ALTER TABLE "ban_hist" DROP CONSTRAINT "ban_hist_user_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_hist" DROP CONSTRAINT "chat_hist_user_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "direct" DROP CONSTRAINT "direct_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "direct" DROP CONSTRAINT "direct_user2_id_fkey";

-- DropForeignKey
ALTER TABLE "direct_hist" DROP CONSTRAINT "direct_hist_direct_id_fkey";

-- DropForeignKey
ALTER TABLE "user_chat" DROP CONSTRAINT "user_chat_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "user_chat" DROP CONSTRAINT "user_chat_user_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "status",
ADD COLUMN     "status" "UserState" DEFAULT 'ONLINE';

-- DropTable
DROP TABLE "ban_hist";

-- DropTable
DROP TABLE "chat";

-- DropTable
DROP TABLE "chat_hist";

-- DropTable
DROP TABLE "direct";

-- DropTable
DROP TABLE "direct_hist";

-- DropTable
DROP TABLE "user_chat";

-- DropEnum
DROP TYPE "ban_type";

-- DropEnum
DROP TYPE "chat_type";

-- DropEnum
DROP TYPE "role";

-- DropEnum
DROP TYPE "status";

-- CreateTable
CREATE TABLE "Channel" (
    "id" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "type" "ChannelType" NOT NULL,
    "password" VARCHAR(72),

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChannel" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel_id" UUID NOT NULL,
    "role" "ChannelRole" NOT NULL,

    CONSTRAINT "UserChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direct" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "target_id" INTEGER NOT NULL,
    "state" "DirectState" NOT NULL,

    CONSTRAINT "Direct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" SERIAL NOT NULL,
    "direct_id" INTEGER NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel_id" UUID NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMute" (
    "id" SERIAL NOT NULL,
    "user_channel_id" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Channel_name_owner_id_idx" ON "Channel"("name", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_owner_id_key" ON "Channel"("name", "owner_id");

-- CreateIndex
CREATE INDEX "UserChannel_user_id_channel_id_role_idx" ON "UserChannel"("user_id", "channel_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannel_user_id_channel_id_key" ON "UserChannel"("user_id", "channel_id");

-- CreateIndex
CREATE INDEX "Direct_user_id_target_id_idx" ON "Direct"("user_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "Direct_user_id_target_id_key" ON "Direct"("user_id", "target_id");

-- CreateIndex
CREATE INDEX "DirectMessage_direct_id_idx" ON "DirectMessage"("direct_id");

-- CreateIndex
CREATE INDEX "ChannelMessage_channel_id_idx" ON "ChannelMessage"("channel_id");

-- CreateIndex
CREATE INDEX "ChannelMute_user_channel_id_idx" ON "ChannelMute"("user_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMute_user_channel_id_key" ON "ChannelMute"("user_channel_id");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannel" ADD CONSTRAINT "UserChannel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannel" ADD CONSTRAINT "UserChannel_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direct" ADD CONSTRAINT "Direct_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direct" ADD CONSTRAINT "Direct_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "Direct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMute" ADD CONSTRAINT "ChannelMute_user_channel_id_fkey" FOREIGN KEY ("user_channel_id") REFERENCES "UserChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
