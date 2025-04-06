import { Body, Controller, Post } from '@nestjs/common';
import { ValidateInviteTokenDto } from 'src/workspace/dto/validateInviteToken.dto';
import { PublicService } from './public.service';
import { CreateSubscriptionFromInvitationDto } from './dto/createSubscriptionFromInvitation.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}
  @Post('validate-invite-token')
  validateInviteToken(@Body() validateInviteTokenDto: ValidateInviteTokenDto) {
    return this.publicService.validateInviteToken(validateInviteTokenDto);
  }

  @Post('create-subscription-from-invitation')
  createSubscriptionWithInvitation(
    @Body()
    createSubscriptionWithInvitation: CreateSubscriptionFromInvitationDto,
  ) {
    return this.publicService.createSubscriptionWithInvitation(
      createSubscriptionWithInvitation,
    );
  }
}
