/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'READER');

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "access";

-- CreateTable
CREATE TABLE "achievement" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(100),

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ban_hist" (
    "id" SERIAL NOT NULL,
    "user_chat_id" INTEGER NOT NULL,
    "sttm" TIMESTAMP(6) DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,
    "ettm" TIMESTAMP(6) DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,
    "type" "ban_type" NOT NULL DEFAULT 'BAN',

    CONSTRAINT "ban_hist_pkey" PRIMARY KEY ("user_chat_id")
);

-- CreateTable
CREATE TABLE "block_hist" (
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,

    CONSTRAINT "block_hist_pkey" PRIMARY KEY ("user1_id","user2_id")
);

-- CreateTable
CREATE TABLE "chat" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(30),
    "type" "chat_type" NOT NULL DEFAULT 'PUBLIC',
    "owner_id" INTEGER NOT NULL,
    "passwd" INTEGER,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id","owner_id")
);

-- CreateTable
CREATE TABLE "chat_hist" (
    "id" SERIAL NOT NULL,
    "user_chat_id" INTEGER NOT NULL,
    "text" TEXT,

    CONSTRAINT "chat_hist_pkey" PRIMARY KEY ("id","user_chat_id")
);

-- CreateTable
CREATE TABLE "direct" (
    "id" SERIAL NOT NULL,
    "user1_id" INTEGER NOT NULL,
    "user2_id" INTEGER NOT NULL,

    CONSTRAINT "direct_pkey" PRIMARY KEY ("id","user1_id","user2_id")
);

-- CreateTable
CREATE TABLE "direct_hist" (
    "id" SERIAL NOT NULL,
    "direct_id" INTEGER NOT NULL,
    "text" TEXT,

    CONSTRAINT "direct_hist_pkey" PRIMARY KEY ("id","direct_id")
);

-- CreateTable
CREATE TABLE "game_hist" (
    "id" SERIAL NOT NULL,
    "player1_id" INTEGER NOT NULL,
    "player2_id" INTEGER NOT NULL,
    "score1" SMALLINT NOT NULL DEFAULT 0,
    "score2" SMALLINT NOT NULL DEFAULT 0,
    "sttm" TIMESTAMP(6) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,
    "ettm" TIMESTAMP(6) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,

    CONSTRAINT "game_hist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picture" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(20) DEFAULT 'default',

    CONSTRAINT "picture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name_id" VARCHAR(30),
    "passwd" INTEGER,
    "picture_id" INTEGER,
    "status" "status" NOT NULL DEFAULT 'ONLINE',
    "ladder" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "user_id" INTEGER NOT NULL,
    "achieve_id" INTEGER NOT NULL,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("user_id","achieve_id")
);

-- CreateTable
CREATE TABLE "user_chat" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "role" "role" NOT NULL DEFAULT 'READER',

    CONSTRAINT "user_chat_pkey" PRIMARY KEY ("id","user_id","chat_id","role")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_description_key" ON "achievement"("description");

-- CreateIndex
CREATE UNIQUE INDEX "chat_id_key" ON "chat"("id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_name_key" ON "chat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chat_hist_id_key" ON "chat_hist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_id_key" ON "direct"("id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_hist_id_key" ON "direct_hist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_hist_direct_id_key" ON "direct_hist"("direct_id");

-- CreateIndex
CREATE UNIQUE INDEX "picture_filename_key" ON "picture"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "user_name_id_key" ON "user"("name_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_passwd_key" ON "user"("passwd");

-- CreateIndex
CREATE UNIQUE INDEX "user_chat_id_key" ON "user_chat"("id");

-- AddForeignKey
ALTER TABLE "ban_hist" ADD CONSTRAINT "ban_hist_user_chat_id_fkey" FOREIGN KEY ("user_chat_id") REFERENCES "user_chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_hist" ADD CONSTRAINT "block_hist_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_hist" ADD CONSTRAINT "block_hist_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_hist" ADD CONSTRAINT "chat_hist_user_chat_id_fkey" FOREIGN KEY ("user_chat_id") REFERENCES "user_chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direct" ADD CONSTRAINT "direct_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direct" ADD CONSTRAINT "direct_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direct_hist" ADD CONSTRAINT "direct_hist_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_hist" ADD CONSTRAINT "game_hist_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_hist" ADD CONSTRAINT "game_hist_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "picture" ADD CONSTRAINT "picture_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achieve_id_fkey" FOREIGN KEY ("achieve_id") REFERENCES "achievement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_chat" ADD CONSTRAINT "user_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_chat" ADD CONSTRAINT "user_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
