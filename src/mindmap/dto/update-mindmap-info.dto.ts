import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const Schema = z.object({
  title: z.string().min(2).max(30),
  emoji: z.string(),
});

export class UpdateMindMapInfoDto extends createZodDto(Schema) {}
