import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class AddSpecialParamsDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Playbook ID',
    example: '64a747b3-4439-4270-8fd4-864059bebfe4',
  })
  'playbookId': string;
}

export class AddSpecialBodyDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Decision Point ID',
    example: '["64a747b3-4439-4270-8fd4-864059bebfe4"]',
  })
  'decisionPointIds': string[];
}

export class AddSpecialProvisionResponseDto {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.SPECIAL_PROVISION_LIST,
  })
  message: string;
}
