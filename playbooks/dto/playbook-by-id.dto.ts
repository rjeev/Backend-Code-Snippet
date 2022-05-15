import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Playbook } from 'src/models/entities/Playbook.entity';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class PlaybookByIdDto {
  @ApiProperty({
    description: 'Playbook ID',
    example: '3d570c37-d1d5-4fd8-9d6c-79f9198b28a0',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PlaybookByIdDtoResponse {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.GET_PLAYBOOK_ID,
  })
  message: string;

  @ApiProperty()
  @Type(() => Playbook)
  data: Playbook;
}
