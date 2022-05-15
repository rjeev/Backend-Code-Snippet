import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class DeletePlaybookSuccessResponseDto {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.DELETE,
  })
  message: string;
}
