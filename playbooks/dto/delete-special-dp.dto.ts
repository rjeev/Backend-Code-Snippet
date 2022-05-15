import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { PlaybookExistsCheck } from 'src/modules/playbooks/validation/playbook-exists.validation';
import { PLAYBOOK_SPECIAL_PROVISION_RESPONSE } from './special-provision.constant';

export class DeleteSpecialDpParamDto {
  @ApiProperty({
    description: 'Playbook ID',
    example: '3d570c37-d1d5-4fd8-9d6c-79f9198b28a0',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(PlaybookExistsCheck)
  playbookId: string;
}

export class DeleteSpecialDpBodyDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Decision Point ID',
    example: '["64a747b3-4439-4270-8fd4-864059bebfe4"]',
  })
  'decisionPointIds': string[];
}

export class DeleteDpSuccess {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    default:
      PLAYBOOK_SPECIAL_PROVISION_RESPONSE.DELETE_SPECIAL_PROVISION.SUCCESS,
  })
  message: string;
}

export class DeleteDpPBadRequest {
  @ApiProperty({
    default: HttpStatus.BAD_REQUEST,
  })
  statusCode: number;

  @ApiProperty({
    default:
      PLAYBOOK_SPECIAL_PROVISION_RESPONSE.DELETE_SPECIAL_PROVISION.BAD_REQUEST,
  })
  message: string;

  @ApiProperty({
    default: 'bad_request',
  })
  type: string;
}
