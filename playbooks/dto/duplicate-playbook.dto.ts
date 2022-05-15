import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, Validate } from 'class-validator';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';
import { PlaybookExistsCheck } from '../validation/playbook-exists.validation';
import { CreatePlaybookSuccessResponseDto } from './create-playbook-response.dto';

export class DuplicatePlaybookDto {
  @ApiPropertyOptional({
    example: 'My Playbook',
  })
  @IsOptional()
  playbookName: string;
}

export class DuplicatePlaybookParamDto {
  @ApiProperty({
    example: '7a97a0c0-2210-40e0-930d-f962ad2c5a2e',
  })
  @IsNotEmpty()
  @IsUUID()
  @Validate(PlaybookExistsCheck, [
    {
      shouldCheckArchive: true,
    },
  ])
  playbookId: string;
}

export class DuplicatePlaybookSuccessResponseDto extends CreatePlaybookSuccessResponseDto {
  @ApiProperty({
    example: PLAYBOOK_RESPONSE.DUPLICATE.SUCCESS,
  })
  message: string;
}
