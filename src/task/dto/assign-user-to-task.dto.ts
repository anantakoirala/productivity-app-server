import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
  userId: z.number(),
  taskId: z.number(),
});

export class AssignUserToTaskDto extends createZodDto(WorkSpaceSchema) {}
