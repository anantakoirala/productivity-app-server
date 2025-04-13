import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const Schema = z.object({
  workspaceId: z.number(),
});

export class CreateMindMapDto extends createZodDto(Schema) {}
