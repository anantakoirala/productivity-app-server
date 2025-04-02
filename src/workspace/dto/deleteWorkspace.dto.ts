import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceName: z.string().min(2),
  workspaceId: z.number(),
});

export class DeleteWorkspaceDto extends createZodDto(WorkSpaceSchema) {}
