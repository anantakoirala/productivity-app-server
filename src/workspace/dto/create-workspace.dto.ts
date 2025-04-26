import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspacename: z.string().min(2),
  workspaceImage: z.any().optional(), // ← just optional, no validation
});

export class CreateWorkSpaceDto extends createZodDto(WorkSpaceSchema) {}
