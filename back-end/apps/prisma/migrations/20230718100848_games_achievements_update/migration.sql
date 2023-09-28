-- CreateEnum
CREATE TYPE "GameScope" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "GameState" AS ENUM ('WAITING_FOR_PLAYERS', 'READY_TO_PLAY', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "GameTexType" AS ENUM ('COLOR', 'TEXTURE');

-- CreateEnum
CREATE TYPE "AchievementKind" AS ENUM ('GAME');

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "scope" "GameScope" NOT NULL,
    "state" "GameState" NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    "max_score" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameUser" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tex" TEXT NOT NULL,
    "tex_type" "GameTexType" NOT NULL,
    "won" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "AchievementKind" NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementUser" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchievementUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Game_state_idx" ON "Game"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE INDEX "GameUser_game_id_idx" ON "GameUser"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "GameUser_game_id_user_id_key" ON "GameUser"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_title_key" ON "Achievement"("title");

-- CreateIndex
CREATE INDEX "AchievementUser_id_idx" ON "AchievementUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementUser_user_id_achievement_id_key" ON "AchievementUser"("user_id", "achievement_id");

-- AddForeignKey
ALTER TABLE "GameUser" ADD CONSTRAINT "GameUser_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameUser" ADD CONSTRAINT "GameUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementUser" ADD CONSTRAINT "AchievementUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementUser" ADD CONSTRAINT "AchievementUser_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
