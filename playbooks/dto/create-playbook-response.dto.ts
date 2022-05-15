import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Playbook } from 'src/models/entities/Playbook.entity';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

export class CreatePlaybookSuccessResponseDto {
  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.CREATED.SUCCESS,
  })
  message: string;

  @ApiProperty()
  @Type(() => Playbook)
  data: Partial<Playbook>;
}

export class MasterTemplateNotFoundResponseDto {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.CREATED.MASTER_TEMPLATE_NOT_FOUND,
  })
  message: string;
}
