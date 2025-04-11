import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
//import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateWorkspaceImageDto } from './dto/upload-workspace-image.dto';
import { UpdateWorkSpaceDto } from './dto/update-workspace.dto';
import { DeleteWorkspaceDto } from './dto/deleteWorkspace.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateInvitationDto } from './dto/createInvitation.dto';
import { UserPermission } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ChangeUserRoleDto } from './dto/changeUserrole.dto';
import { RemoveUserFromWorkspaceDto } from './dto/removeUserFromWorkspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async create(
    createWorkspaceDto: CreateWorkSpaceDto,
    userId: number,
    file: any,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const transaction = await this.prisma.$transaction(async (prisma) => {
        const workspace = await prisma.workSpace.create({
          data: {
            name: createWorkspaceDto.workspacename,
            userId: userId,
            image: file ? file.filename : null, // ✅ Assign filename if file exists
            inviteCode: uuidv4(),
            adminCode: uuidv4(),
            canEditCode: uuidv4(),
            readOnlyCode: uuidv4(),
          },
        });

        await prisma.subscription.create({
          data: {
            userId: userId,
            workspaceId: workspace.id,
            useRole: 'ADMIN',
          },
        });
        return workspace;
      });

      return { success: true, workspace: transaction };
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: number) {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId: userId },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const myworkspaces = subscriptions.map((sub) => sub.workspace);

      const myworkspacesAsAdmin = subscriptions
        .filter((sub) => sub.useRole === 'ADMIN')
        .map((sub) => sub.workspace);

      return { success: true, workspaces: myworkspaces, myworkspacesAsAdmin };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id, userId: userId },
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              emoji: true,
            },
          },
        },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      return { success: true, workspace };
    } catch (error) {
      throw error;
    }
  }

  async getWorkspaceSettingDetail(id: number, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      return { success: true, workspace };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkSpaceDto) {
    try {
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const updatedWorkspace = await this.prisma.workSpace.update({
        where: { id: id },
        data: {
          name: updateWorkspaceDto.name,
        },
      });

      return {
        success: true,
        message: 'Workspace updated successfully',
        updatedWorkspace,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }

  async deleteWorkspace(
    deleteWorkspaceDto: DeleteWorkspaceDto,
    userId: number,
  ) {
    try {
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: deleteWorkspaceDto.workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }

      const userRole = userSubscription.useRole;
      if (userRole === 'CAN_EDIT' || userRole === 'READ_ONLY') {
        throw new ForbiddenException('Unauthorized');
      }
      const workspace = await this.prisma.workSpace.findUnique({
        where: {
          id: deleteWorkspaceDto.workspaceId,
          name: deleteWorkspaceDto.workspaceName,
        },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      await this.prisma.workSpace.delete({
        where: { id: deleteWorkspaceDto.workspaceId },
      });
      return { success: true, message: 'Workspace deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async saveWorkspaceImage(
    updateWorkspaceImageDto: UpdateWorkspaceImageDto,
    userId: number,
    file: any,
  ) {
    try {
      console.log('file', file);
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: +updateWorkspaceImageDto.workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (!file) {
        throw new NotFoundException('File not found');
      }

      if (workspace.image) {
        const imagePath = path.join(process.cwd(), 'uploads', workspace.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const updatedWorkspace = await this.prisma.workSpace.update({
        where: { id: +updateWorkspaceImageDto.workspaceId },
        data: { image: file.filename },
      });

      return {
        success: true,
        message: 'Image saved',
        updatedWorkspace,
      };
    } catch (error) {
      throw error;
    }
  }

  async userRoleForWorkspace(id: number, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          Subscriptions: {
            where: {
              workspaceId: id,
            },
            select: {
              useRole: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const userRole = user.Subscriptions[0].useRole;

      return { success: true, userRole };
    } catch (error) {
      throw error;
    }
  }

  async createInvitation(createInvitaion: CreateInvitationDto, userId: number) {
    try {
      const invitationSender = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!invitationSender) {
        throw new NotFoundException('Sender not found');
      }

      const roleMap = {
        admin: UserPermission.ADMIN,
        viewer: UserPermission.READ_ONLY,
        editor: UserPermission.CAN_EDIT,
      };
      const role = roleMap[createInvitaion.role];
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: createInvitaion.id },
        include: {
          Subscriber: {
            select: {
              user: { select: { email: true } }, // Select only email from User
            },
          },
        },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const subscribersEmail = workspace.Subscriber.map(
        (sub) => sub.user.email,
      );

      const nonSubscribersEmail = createInvitaion.tags.filter(
        (tag) => !subscribersEmail.includes(tag),
      );

      if (nonSubscribersEmail.length === 0) {
        throw new BadRequestException('No one to send invitation');
      }

      const invitationData = nonSubscribersEmail.map((data: string) => ({
        email: data,
        workspaceId: createInvitaion.id,
        token: uuidv4(),
        userRole: role,
      }));

      // Batch create invitations (if no duplicates)
      const invitationsToCreate = [];
      for (let i = 0; i < invitationData.length; i++) {
        const isDuplicate = await this.checkDuplicateInvitation(
          invitationData[i].email,
          invitationData[i].workspaceId,
        );

        if (!isDuplicate) {
          invitationsToCreate.push(invitationData[i]);
        }
      }

      if (invitationsToCreate.length > 0) {
        await this.prisma.invitation.createMany({ data: invitationsToCreate });

        const clientUrl = this.configService.get<string>('client_url');

        // Send emails
        for (const invite of invitationsToCreate) {
          const invitationLink = `${clientUrl}/invite?token=${invite.token}`;

          await this.mailerService.sendMail({
            to: invite.email,
            subject: `You've been invited to join workspace "${workspace.name}"`,
            template: './invite', // corresponds to `templates/invite.hbs`
            context: {
              email: invite.email,
              sender: invitationSender.email,
              workspace: workspace.name,
              link: invitationLink,
              role: createInvitaion.role,
            },
          });
        }
      }

      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error in creating invitation:', error);
      throw error; // Rethrow the error or handle it as needed
    }
  }

  async checkDuplicateInvitation(email: string, workspaceId: number) {
    try {
      const existingInvitation = await this.prisma.invitation.findFirst({
        where: { email: email, workspaceId: workspaceId },
      });
      return !!existingInvitation; // returns true if found
    } catch (error) {
      throw error;
    }
  }

  async getWorkspaceSubscribers(id: number) {
    try {
      const subscribers = await this.prisma.subscription.findMany({
        where: { workspaceId: id },
        include: {
          user: {
            select: { name: true, username: true, image: true, id: true },
          },
        },
      });
      const modifiedSubscribers = subscribers.map((subscriber) => ({
        userId: subscriber.user.id,
        userRole: subscriber.useRole,
        name: subscriber.user.name,
        userName: subscriber.user.username,
        userImage: subscriber.user.image,
        workspaceId: subscriber.workspaceId,
      }));

      return { success: true, subscribers: modifiedSubscribers };
    } catch (error) {
      throw error;
    }
  }

  async getWorkspaceTags(id: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: id },
        include: { tags: true },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      return { success: true, tags: workspace.tags };
    } catch (error) {
      throw error;
    }
  }

  async getWorkspaceTasks(id: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: id },
        include: { tasks: true },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      return { success: true, tasks: workspace.tasks };
    } catch (error) {
      throw error;
    }
  }

  async changeUserRole(changeUserRoleDto: ChangeUserRoleDto, userId: number) {
    try {
      console.log('changeUserRoledto', changeUserRoleDto);

      const initiatorRole = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: changeUserRoleDto.workspaceId },
      });

      if (!initiatorRole) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }
      if (
        initiatorRole.useRole === 'CAN_EDIT' ||
        initiatorRole.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }
      const subscriber = await this.prisma.subscription.findFirst({
        where: {
          userId: changeUserRoleDto.userId,
          workspaceId: changeUserRoleDto.workspaceId,
        },
      });

      if (!subscriber) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.subscription.update({
        where: {
          userId_workspaceId: {
            userId: changeUserRoleDto.userId,
            workspaceId: changeUserRoleDto.workspaceId,
          },
        },
        data: {
          useRole: { set: changeUserRoleDto.userRole as UserPermission },
        },
      });
      return this.getWorkspaceSubscribers(changeUserRoleDto.workspaceId);
    } catch (error) {
      throw error;
    }
  }
  async removeUserFromWorkspace(
    removeUserFromWorkspaceDto: RemoveUserFromWorkspaceDto,
    userId: number,
  ) {
    try {
      const initiatorRole = await this.prisma.subscription.findFirst({
        where: {
          userId: userId,
          workspaceId: removeUserFromWorkspaceDto.workspaceId,
        },
      });

      if (!initiatorRole) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }
      // Only Admin can remove
      if (
        initiatorRole.useRole === 'CAN_EDIT' ||
        initiatorRole.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }
      // Check if the initiator workspace is same as user workspace
      if (
        initiatorRole.workspaceId !== removeUserFromWorkspaceDto.workspaceId
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      // Check if user is in initiator workspace or not

      const subscriber = await this.prisma.subscription.findFirst({
        where: {
          userId: removeUserFromWorkspaceDto.userId,
          workspaceId: removeUserFromWorkspaceDto.workspaceId,
        },
      });

      if (!subscriber) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.subscription.delete({
        where: {
          userId_workspaceId: {
            userId: removeUserFromWorkspaceDto.userId,
            workspaceId: removeUserFromWorkspaceDto.workspaceId,
          },
        },
      });
      return this.getWorkspaceSubscribers(
        removeUserFromWorkspaceDto.workspaceId,
      );
    } catch (error) {
      throw error;
    }
  }
}
