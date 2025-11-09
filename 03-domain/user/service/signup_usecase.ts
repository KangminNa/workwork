import { create, findUnique } from '../../../02-feature/src';
import { hash } from 'bcrypt';
import { CreateUserInput } from '../shared/user_dto';

export class SignupUsecase {
  async execute(input: CreateUserInput) {
    const { email, name, password } = input;

    const existingUser = await findUnique('user', {
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hash(password, 10);

    const user = await create('user', {
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
