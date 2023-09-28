import { PrismaClient, User } from '@prisma/client';
import { generate_users } from './generate_users';
import { Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

const num_users = 10;
const users: User[] = generate_users(num_users);
const prisma: PrismaClient = new PrismaClient();

const logger = new Logger('Populate');

async function fill_users(): Promise<void> {
  await prisma.user.createMany({
    data: users,
  });
}

async function remove_users(): Promise<void> {
  for (const user of this.users) {
    await prisma.user.delete({
      where: { id: user.id },
    });
  }
}

async function main() {
  await fill_users();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: PrismaClientKnownRequestError) => {
    logger.warn(e.message);
    logger.warn('Users already in db');
    await prisma.$disconnect();
  })
  .finally(async () => {
    logger.log('Popualate script ended OK');
  });
