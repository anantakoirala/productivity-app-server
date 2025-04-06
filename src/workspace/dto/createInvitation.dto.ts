import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  tags: z.array(z.string().email()),
  role: z.string(),
  id: z.number(),
});

export class CreateInvitationDto extends createZodDto(WorkSpaceSchema) {}
