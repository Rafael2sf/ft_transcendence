import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';

faker.seed(42);

export function generate_users(num: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < num; i++) {
    users.push(generate_user());
  }
  return users;
}

export function generate_user(): User {
  const name: string = faker.person.firstName();
  const user: User = {
    id: faker.number.int({ min: 69, max: 420 }),
    intraname: faker.number.int({ min: 0, max: 1 }) ? name.toLowerCase() : name, // randomize capitalization
    name: faker.person.fullName({ firstName: name }).replace(/\s/g, ''), // delete all spaces in string
    ladder: faker.number.int({ min: 0, max: 20 }),
    is_two_factor_enabled: false,
    two_factor_secret: undefined,
    picture: '/profile.png',
    status: 'ONLINE',
  };
  return user;
}
