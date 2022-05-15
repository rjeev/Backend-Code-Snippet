import { ApiProperty } from '@nestjs/swagger';
import { PlaybookStatusType } from '../playbooks.interface';

export class UserPlaybookCountByStatusType {
  @ApiProperty({
    description:
      'Playbook status - one of ACCEPTED, PENDING, INREVIEW, ARCHIVE',
    example: 'PENDING',
  })
  playbook_status: PlaybookStatusType;

  @ApiProperty({
    description: 'Number of playbook for given status',
    example: 5,
  })
  count: number;
}
