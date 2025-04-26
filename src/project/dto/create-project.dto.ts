import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  name: z.string().min(2).max(30),
  workspaceId: z.number(),
});

export class CreateProjectDto extends createZodDto(WorkSpaceSchema) {}
