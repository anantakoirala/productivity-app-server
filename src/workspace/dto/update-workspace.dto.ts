import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  name: z.string().min(2),
});

export class UpdateWorkSpaceDto extends createZodDto(WorkSpaceSchema) {}
