import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Playbook } from 'src/models/entities/Playbook.entity';
import { PlaybooksController } from './playbooks.controller';
import { PlaybooksService } from './playbooks.service';
import { PlaybookRepository } from './playbooks.repository';
import { PlaybookUserModule } from '../playbook-user/playbook-user.module';
import { AuthenticationMiddleware } from 'src/common/middleware/authenticate.middleware';
import { UsersModule } from '../users/users.module';
import { PlaybookExistsCheck } from './validation/playbook-exists.validation';
import { MasterTemplateModule } from '../master-template/master-template.module';
import { PlaybookDecisionPointsModule } from '../playbook-decision-points/playbook-decision-points.module';
import { PlaybookUserRepository } from '../playbook-user/playbook-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Playbook,
      PlaybookRepository,
      PlaybookUserRepository,
    ]),
    PlaybookUserModule,
    UsersModule,
    MasterTemplateModule,
    PlaybookDecisionPointsModule,
  ],
  controllers: [PlaybooksController],
  providers: [PlaybooksService, PlaybookExistsCheck],
  exports: [PlaybooksService],
})
export class PlaybooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(PlaybooksController);
  }
}
