import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateWorkSpaceImageSchema = z.object({
  workspaceId: z.number(),
});

export class UpdateWorkspaceImageDto extends createZodDto(
  UpdateWorkSpaceImageSchema,
) {}
