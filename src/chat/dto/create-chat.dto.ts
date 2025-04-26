import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  message: z.string(),
  workspaceId: z.coerce.number(),
  chatId: z.coerce.number(),
});

export class CreateChatDto extends createZodDto(WorkSpaceSchema) {}
