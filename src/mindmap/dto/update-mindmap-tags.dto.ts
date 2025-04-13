import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  activeTagIds: z.array(z.number()),
});
export class UpdateMindMapTagsDto extends createZodDto(WorkSpaceSchema) {}
