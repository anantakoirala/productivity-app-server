import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
  userId: z.number(),
  mindmapId: z.number(),
});

export class AssignUserToMindmapDto extends createZodDto(WorkSpaceSchema) {}
