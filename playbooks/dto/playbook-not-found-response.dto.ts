import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class PlaybookNotFoundResponseDto {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
  })
  statusCode: number;

  @ApiProperty({
    isArray: true,
    example: PLAYBOOK_RESPONSE.NOT_FOUND,
  })
  message: [string];

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    example: 'Any JSON string',
  })
  errorStack: string;
}
