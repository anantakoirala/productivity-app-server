import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  projectId: z.number(),
  workspaceId: z.number(),
});

export class DeleteProjectDto extends createZodDto(WorkSpaceSchema) {}
