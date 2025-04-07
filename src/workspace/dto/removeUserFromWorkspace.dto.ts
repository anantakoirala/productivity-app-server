import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
  userId: z.number(),
});

export class RemoveUserFromWorkspaceDto extends createZodDto(WorkSpaceSchema) {}
