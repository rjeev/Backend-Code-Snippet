import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';
import { PlaybooksService } from '../playbooks.service';

@Injectable()
@ValidatorConstraint({ name: 'PlaybookExistsCheck', async: true })
export class PlaybookExistsCheck implements ValidatorConstraintInterface {
  constructor(private playbookService: PlaybooksService) {}

  async validate(id: string, args?: ValidationArguments) {
    try {
      if (args && args.constraints && args.constraints[0].shouldCheckArchive) {
        await this.playbookService.findPlaybookById(
          id,
          args.constraints[0].shouldCheckArchive,
        );
      } else {
        await this.playbookService.findPlaybookById(id);
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return PLAYBOOK_RESPONSE.NOT_FOUND;
  }
}
