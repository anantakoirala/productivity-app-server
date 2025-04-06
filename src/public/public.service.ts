import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidateInviteTokenDto } from 'src/workspace/dto/validateInviteToken.dto';
import { CreateSubscriptionFromInvitationDto } from './dto/createSubscriptionFromInvitation.dto';

@Injectable()
export class PublicService {
  constructor(private prismaService: PrismaService) {}

  async validateInviteToken(validateInviteTokenDto: ValidateInviteTokenDto) {
    try {
      console.log('validate token', validateInviteTokenDto);
      const result = await this.prismaService.invitation.findFirst({
        where: {
          email: validateInviteTokenDto.email,
          token: validateInviteTokenDto.token,
        },
      });
      console.log('result', result);
      return { success: true, inviteData: result };
    } catch (error) {
      throw error;
    }
  }

  async createSubscriptionWithInvitation(
    createSubscriptionWithInvitation: CreateSubscriptionFromInvitationDto,
  ) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const invitation = await tx.invitation.findFirst({
          where: {
            email: createSubscriptionWithInvitation.email,
            token: createSubscriptionWithInvitation.token,
          },
        });

        if (!invitation) {
          throw new BadRequestException('Invalid invitation or token');
        }

        const user = await tx.user.findFirst({
          where: { email: createSubscriptionWithInvitation.email },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Create the subscription
        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
            workspaceId: invitation.workspaceId,
            useRole: invitation.userRole,
          },
        });

        // Only delete the invitation if the subscription creation succeeds
        if (subscription) {
          await tx.invitation.delete({
            where: { id: invitation.id },
          });
        } else {
          throw new InternalServerErrorException(
            'Failed to create subscription',
          );
        }
      });

      return { success: true, message: 'Subscription added successfully' };
    } catch (error) {
      console.error('Error creating subscription with invitation:', error);
      throw error; // This will rethrow the error, or you can customize the error message
    }
  }
}
