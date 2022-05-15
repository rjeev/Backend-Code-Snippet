import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { GetSpecialResponseDto } from '.';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class ListSpecialProvisionSuccessResponseDto {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.SPECIAL_PROVISION_LIST,
  })
  message: string;

  @ApiProperty({ isArray: true })
  data: GetSpecialResponseDto;
}
