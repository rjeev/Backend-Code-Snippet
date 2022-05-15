import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSpecialDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Playbook ID',
    example: '64a747b3-4439-4270-8fd4-864059bebfe4',
  })
  playbookId: string;
}

export class GetSpecialResponseDto {
  @ApiProperty({
    description: 'Master tempate decision point ID',
    example: '2dea8a3c-32de-4999-9453-0c648ca683fb',
  })
  id: string;

  @ApiProperty({
    description: 'ID of special provision decision point in playbook',
    example: '2dea8a3c-32de-4999-9453-0c648ca683fb',
  })
  playbookDpId: string;

  @ApiProperty({
    description: 'Created Date',
    example: '2022-03-24T12:06:41.382Z',
  })
  created: Date | null;

  @ApiProperty({
    description: 'Label of provision',
    example: 'Communication',
  })
  displayLabel: string | null;

  @ApiProperty({
    description: 'If provision exists in playbook',
    example: true,
  })
  exists: boolean;
}
