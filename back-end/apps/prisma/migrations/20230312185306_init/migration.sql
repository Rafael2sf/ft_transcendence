-- CreateEnum
CREATE TYPE "status" AS ENUM ('OFFLINE', 'IN_GAME', 'ONLINE');

-- CreateEnum
CREATE TYPE "chat_type" AS ENUM ('PRIVATE', 'PUBLIC', 'PROTECTED');

-- CreateEnum
CREATE TYPE "ban_type" AS ENUM ('MUTE', 'BAN');

-- CreateEnum
CREATE TYPE "access" AS ENUM ('ADMIN', 'READER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "login42" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT 'default',
    "status" "status" NOT NULL DEFAULT 'ONLINE',
    "lvl" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login42_key" ON "User"("login42");
