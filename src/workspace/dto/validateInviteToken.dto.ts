import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  token: z.string().min(2),
  email: z.string().email(),
});

export class ValidateInviteTokenDto extends createZodDto(WorkSpaceSchema) {}
