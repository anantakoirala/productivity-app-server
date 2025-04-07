import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  userRole: z.string().min(2),
  workspaceId: z.number(),
  userId: z.number(),
});

export class ChangeUserRoleDto extends createZodDto(WorkSpaceSchema) {}
