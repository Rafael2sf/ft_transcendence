// TODO: replace this values with the ones in the front-end

import { ChannelType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.gameUser.deleteMany({
      where: { game: { state: { not: 'FINISHED' } } },
    }),
    prisma.game.deleteMany({
      where: { state: { not: 'FINISHED' } },
    }),
  ]);

  await prisma.achievement.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: 'Let’s Get It Started',
      description: 'played 1 game',
      image: '1game',
      kind: 'GAME',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 2 },
    create: {
      id: 2,
      title: 'Addicted To You',
      description: 'You played 10 games',
      kind: 'GAME',
      image: '10games',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 3 },
    create: {
      id: 3,
      title: 'Hit Me Baby One More Time',
      description: 'You played 100 games',
      kind: 'GAME',
      image: '100games',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 4 },
    create: {
      id: 4,
      title: 'Sexy And I Know It',
      description: 'You got the first position on the leaderboard',
      kind: 'LADDER',
      image: 'first_place',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 5 },
    create: {
      id: 5,
      title: 'All I Do Is Win',
      description: 'You got the second position on the leaderboard',
      kind: 'LADDER',
      image: 'second_place',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 6 },
    create: {
      id: 6,
      title: "Started From The Bottom Now We're Here",
      description: 'You got the third position on the leaderboard',
      kind: 'LADDER',
      image: 'third_place',
    },
    update: {},
  });
  await prisma.achievement.upsert({
    where: { id: 7 },
    create: {
      id: 7,
      title: 'Thank U, Next',
      description:
        'You won a game with max score without getting scored on even once',
      kind: 'GAME',
      image: 'clean_sheet',
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: 1 },
    create: {
      name: 'marvin',
      intraname: 'marvin',
      ladder: 8820,
      status: 'ONLINE',
      picture: '/marvin.jpg',
      achievements: {
        createMany: {
          data: [
            { achievement_id: 1 },
            { achievement_id: 2 },
            { achievement_id: 3 },
            { achievement_id: 4 },
            { achievement_id: 5 },
            { achievement_id: 6 },
            { achievement_id: 7 },
          ],
        },
      },
    },
    update: {},
  });

  await prisma.channel.upsert({
    where: {
      name_owner_id: { name: 'general', owner_id: 1 },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'general',
      type: ChannelType.PUBLIC,
      owner: { connect: { id: 1 } },
      UserChannel: {
        connectOrCreate: {
          where: { id: 1 },
          create: {
            user_id: 1,
            role: 'OWNER',
          },
        },
      },
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
