import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty } from 'class-validator';
import { PlaybookTypes, PlaybookTypesType } from '../playbooks.interface';

export class CreatePlaybookDto {
  @ApiProperty({
    type: 'enum',
    enum: PlaybookTypes,
    example: PlaybookTypes['ONE-WAY'],
  })
  @IsNotEmpty()
  @Equals('ONE-WAY', {
    message: 'Playbook type must be of ONE-WAY',
  })
  playbookType: PlaybookTypesType;

  @ApiProperty({
    example: 'My Playbook',
  })
  @IsNotEmpty()
  playbookName: string;
}
