import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
  name: z.string().min(2, 'Name should be atleast 2 characters').max(30),
  projectId: z.coerce.number().min(1, 'Project is required'),
});

export class CreateTaskDto extends createZodDto(WorkSpaceSchema) {}
