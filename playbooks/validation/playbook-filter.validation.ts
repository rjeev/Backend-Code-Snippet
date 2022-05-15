import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { difference } from 'lodash';

import PLAYBOOK_RESPONSE from '../playbook-response-message.constant';
import { PLAYBOOK_VALID_STATUS_ARRAY } from 'src/common/constants';

@Injectable()
@ValidatorConstraint({ name: 'PlaybookFilterValidator', async: false })
export class PlaybookFilterValidator implements ValidatorConstraintInterface {
  validate(status: string[]) {
    const checkIfRequestContainsInvalidStatus = difference(
      status,
      PLAYBOOK_VALID_STATUS_ARRAY,
    );

    return !(checkIfRequestContainsInvalidStatus.length > 0);
  }

  defaultMessage() {
    return PLAYBOOK_RESPONSE.FILTER.INVALID_STATUS;
  }
}
