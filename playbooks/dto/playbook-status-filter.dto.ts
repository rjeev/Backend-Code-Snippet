import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { PlaybookFilterValidator } from '../validation/playbook-filter.validation';

export class PlaybookStatusFilterDto {
  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'Any status of playbook, comma separated if multiple',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value.split(',').map((status: string) => status.trim()),
  )
  @Validate(PlaybookFilterValidator)
  status?: string[];
}
