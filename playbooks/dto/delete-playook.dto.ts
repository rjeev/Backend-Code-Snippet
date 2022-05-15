import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { PlaybookExistsCheck } from '../validation/playbook-exists.validation';

export class DeletePlaybookDto {
  @ApiProperty({
    description: 'Playbook ID',
    example: '3d570c37-d1d5-4fd8-9d6c-79f9198b28a0',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(PlaybookExistsCheck)
  'id': string;
}
