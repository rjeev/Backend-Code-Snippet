import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Playbook } from 'src/models/entities/Playbook.entity';
import { UserPlaybookCountByStatusType } from './user-playbook-count.dto';
import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';

class ListPlaybookData {
  @ApiProperty({
    isArray: true,
  })
  @Type(() => UserPlaybookCountByStatusType)
  counts: UserPlaybookCountByStatusType;

  @ApiProperty({
    isArray: true,
  })
  @Type(() => Playbook)
  list: Playbook;
}

export class ListPlaybookSuccessResponseDto {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: PLAYBOOK_RESPONSE.LIST,
  })
  message: string;

  @ApiProperty()
  @Type(() => ListPlaybookData)
  data: ListPlaybookData;
}
