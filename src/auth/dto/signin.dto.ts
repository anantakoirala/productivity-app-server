import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty('Password is required'), // Ensures password is not empty,
});

export class SignInDto extends createZodDto(SignInSchema) {}
