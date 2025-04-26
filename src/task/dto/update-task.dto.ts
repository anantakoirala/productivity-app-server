import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z.object({
  workspaceId: z.number(),
  icon: z.string().optional(),
  title: z.string().optional(),
  activeTagIds: z.array(z.number()),
  projectId: z.coerce.number().min(1, 'Project is required'),
  date: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .nullable()
    .optional(),
  content: z.any(),
});
export class UpdateTaskDto extends createZodDto(WorkSpaceSchema) {}
