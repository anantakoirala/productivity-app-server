import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  id: z.number(),
  workspaceId: z.number(),
});

export class DeleteTagDto extends createZodDto(WorkSpaceSchema) {}
