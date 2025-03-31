import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(5),
    new_password: z.string().min(5),
    repeat_password: z.string(),
  })
  .refine((data) => data.new_password === data.repeat_password, {
    message: 'Password does not match',
    path: ['repeat_password'],
  })
  .refine((data) => data.new_password === data.current_password, {
    message: 'Current password should not match the old password',
    path: ['new_password'],
  });

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
