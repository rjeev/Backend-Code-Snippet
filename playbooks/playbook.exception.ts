import { HttpException, HttpStatus } from '@nestjs/common';

export class PlaybookNotFound extends HttpException {
  constructor() {
    super(
      {
        type: 'resource_not_found',
        message: 'Playbook not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class SpecialProvisionNotFound extends HttpException {
  constructor() {
    super(
      {
        type: 'resource_not_found',
        message: 'Special provision not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
