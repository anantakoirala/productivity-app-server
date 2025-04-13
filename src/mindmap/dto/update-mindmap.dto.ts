import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const Schema = z.object({
  workspaceId: z.number(),
  content: z.any(),
});

export class UpdateMindMapDto extends createZodDto(Schema) {}
