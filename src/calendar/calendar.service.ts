import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarDetails(userId: number) {
    try {
      const userSubscriptions = await this.prisma.subscription.findMany({
        where: {
          userId: userId,
        },
        include: {
          workspace: {
            include: {
              tasks: true,
            },
          },
        },
      });

      if (!userSubscriptions) {
        return { success: true, allTasks: [] };
      }
      // const allTasks = userSubscriptions.flatMap((subscription) => {
      //   return subscription.workspace.tasks.map((task) => ({
      //     title: task.title,
      //     taskDate: task.date?.from
      //       ? {
      //           id: task.date.id,
      //           from: task.date.from ? new Date(task.date.from) : undefined,
      //           to: task.date.to ? new Date(task.date.to) : undefined,
      //         }
      //       : null,
      //     workspaceId: subscription.workspace.id,
      //     workspaceName: subscription.workspace.name,
      //     taskId: task.id,
      //   }));
      // });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
