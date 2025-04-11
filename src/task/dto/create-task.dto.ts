import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
});

export class CreateTaskDto extends createZodDto(WorkSpaceSchema) {}
