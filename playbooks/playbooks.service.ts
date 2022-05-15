import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MasterTemplate } from 'src/models/entities/MasterTemplate.entity';
import { Playbook } from 'src/models/entities/Playbook.entity';
import { PlaybookDecisionPoint } from 'src/models/entities/PlaybookDecisionPoint.entity';
import { PlaybookUser } from 'src/models/entities/PlaybookUser.entity';
import { Connection, Not, QueryRunner } from 'typeorm';
import { MasterTemplateService } from '../master-template/master-template.service';
import { PlaybookDecisionPointsService } from '../playbook-decision-points/playbook-decision-points.service';
import { LastVisitedDP } from '../playbook-decision-points/playbook-dp.interface';
import { PlaybookUserService } from '../playbook-user/playbook-user.service';
import { UserProfile } from '../users/users.interface';
import {
  CreatePlaybookDto,
  DuplicatePlaybookDto,
  DuplicatePlaybookParamDto,
} from './dto';
import PLAYBOOK_RESPONSE from './playbook-response-message.constant';
import { PlaybookNotFound } from './playbook.exception';
import { PlaybookStatus } from './playbooks.interface';
import { PlaybookRepository } from './playbooks.repository';
import { DecisionPointType } from 'src/playbook/playbook.interface';
import { MasterTemplateDecisionPoint } from 'src/models/entities/MasterTemplateDecisionPoint.entity';

@Injectable()
export class PlaybooksService {
  private logger: Logger;
  constructor(
    @InjectRepository(PlaybookRepository)
    private readonly playbookRepository: PlaybookRepository,
    private readonly connection: Connection,
    private readonly masterTemplateService: MasterTemplateService,
    private readonly playbookUserService: PlaybookUserService,
    private readonly playbookDecisionPointsService: PlaybookDecisionPointsService,
  ) {
    this.logger = new Logger(PlaybooksService.name);
  }

  async archivePlaybook(playbookId: string): Promise<any> {
    return this.playbookRepository.updatePlaybookStatus(playbookId, 'ARCHIVED');
  }

  async deletePlaybook(playbookId: string): Promise<any> {
    return this.playbookRepository.update(
      {
        id: playbookId,
      },
      {
        deleted: true,
      },
    );
  }

  transformUserPlaybooks(playbooks: PlaybookUser[]): Playbook[] {
    const transformed = playbooks.map(
      (item: { playbook: any }) => item.playbook,
    );
    return transformed;
  }

  async findPlaybookById(
    id: string,
    shouldCheckArchive = false,
    shouldJoinMasterTemplate = false,
  ): Promise<Playbook> {
    const condition = {
      where: {
        id,
        deleted: false,
      },
    };

    if (shouldCheckArchive) {
      condition.where['status'] = Not('ARCHIVED');
    }

    if (shouldJoinMasterTemplate) {
      condition['relations'] = ['masterTemplate'];
    }

    return this.playbookRepository.findOneOrFail(condition);
  }

  /**
   *
   * @param {Playbook} id
   * @returns returns confirmedDPCount of playbook
   */
  async findPlaybookConfirmedDPCount(
    id: string,
  ): Promise<Pick<Playbook, 'confirmedDPCount'>> {
    return this.playbookRepository.findOneOrFail({
      select: ['confirmedDPCount'],
      where: {
        id,
      },
    });
  }

  /**
   * Create Playbook
   * Steps
   * 1. Create new playbook on db
   * 2. Create new playbook user on db
   * 3. Clone master template decision point to playbook decision point
   */
  async createPlaybook(
    createPlaybookDto: CreatePlaybookDto,
    currentUser: UserProfile,
  ): Promise<Playbook> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('createPlaybook: Check for master template');
      const masterTemplate: MasterTemplate[] =
        await this.masterTemplateService.findMasterTemplateWithStandardDecisionPoint();

      if (
        masterTemplate.length === 0 ||
        masterTemplate[0].masterTemplateDecisionPoints.length === 0
      ) {
        this.logger.error('createPlaybook: Error on getting master template');
        throw new NotFoundException(
          PLAYBOOK_RESPONSE.CREATED.MASTER_TEMPLATE_NOT_FOUND,
        );
      }

      this.logger.log('createPlaybook: Create playbook on db');
      const newPlaybook: Playbook = this.playbookRepository.create({
        name: createPlaybookDto.playbookName,
        playbookType: createPlaybookDto.playbookType,
        status: PlaybookStatus.PENDING,
        owner: currentUser,
        createdBy: currentUser.id,
        ownerOrganization: currentUser.organization,
        masterTemplate: masterTemplate[0],
        totalDPCount: masterTemplate[0].totalDPCount,
      });
      const createdPlaybook = await queryRunner.manager.save(newPlaybook);

      this.logger.log(
        'createPlaybook: Create playbook decision points from referenced master template decision points',
      );
      await this.playbookDecisionPointsService.createPlaybookDecisionPointsFromMaster(
        masterTemplate[0].masterTemplateDecisionPoints,
        createdPlaybook,
        queryRunner,
      );

      this.logger.log('createPlaybook: Create playbook user data on db');
      await this.playbookUserService.sharePlaybookToOrganizationUsers(
        currentUser.organization,
        createdPlaybook,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return createdPlaybook;
    } catch (err) {
      this.logger.error('createPlaybook: Error on creating new playbook');
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  incrementConfirmedDPCount(
    playbookId: string,
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> {
    return this.playbookRepository.incrementConfirmedDPCount(
      playbookId,
      transactionQueryRunner,
    );
  }

  updatePlaybook(
    playbookId: string,
    lastVisitedDP: LastVisitedDP,
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> {
    if (transactionQueryRunner) {
      return transactionQueryRunner.manager.update(
        Playbook,
        {
          id: playbookId,
        },
        {
          lastVisitedDP,
        },
      );
    }

    return this.playbookRepository.update(
      {
        id: playbookId,
      },
      { lastVisitedDP },
    );
  }

  /**
   * Duplicate Playbook
   * Steps
   * 1. Create new playbook along with all decision points on db cloning from given playbook id
   * 2. Share playbook to all organization user
   *
   * @param { DuplicatePlaybookDto } duplicatePlaybookDto
   * @param { UserProfile } currentUser
   * @returns Newly duplicated playbook
   */
  async duplicatePlaybook(
    duplicatePlaybookParamDto: DuplicatePlaybookParamDto,
    duplicatePlaybookDto: DuplicatePlaybookDto,
    currentUser: UserProfile,
  ): Promise<Playbook> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('duplicatePlaybook: Get existing playbook');
      const playbookFindCondition = {
        shouldCheckArchive: true,
        shouldJoinMasterTemplate: true,
      };
      const existingPlaybook: Playbook | undefined =
        await this.findPlaybookById(
          duplicatePlaybookParamDto.playbookId,
          playbookFindCondition.shouldCheckArchive,
          playbookFindCondition.shouldJoinMasterTemplate,
        );

      if (!existingPlaybook) {
        throw new PlaybookNotFound();
      }

      const existingPlaybookDPs: Omit<
        PlaybookDecisionPoint,
        'id' | 'playbook_id' | 'created' | 'modified'
      >[] = await this.playbookDecisionPointsService.getAllPlaybookDPsOmittingIsConfirmed(
        existingPlaybook.id,
      );

      // Create playbook entry cloning from existing one
      const duplicatedPlaybook: Playbook = this.playbookRepository.create({
        name:
          duplicatePlaybookDto.playbookName || `${existingPlaybook.name}-COPY`,
        playbookType: existingPlaybook.playbookType,
        status: PlaybookStatus.PENDING,
        shortDesc: existingPlaybook.shortDesc,
        createdBy: currentUser.id,
        owner: currentUser,
        ownerOrganization: currentUser.organization,
        masterTemplate: existingPlaybook.masterTemplate,
        totalDPCount: existingPlaybook.totalDPCount,
        playbookDecisionPoints: existingPlaybookDPs,
      });

      const createdPlaybook: Playbook = await queryRunner.manager.save(
        duplicatedPlaybook,
      );

      this.logger.log('duplicatePlaybook: Create playbook users data on db');
      await this.playbookUserService.sharePlaybookToOrganizationUsers(
        currentUser.organization,
        createdPlaybook,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      return createdPlaybook;
    } catch (err) {
      this.logger.error(
        `duplicatePlaybook: ${err.message} || Error on creating new playbook`,
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMasterTemplateDecisionPointByIds(
    masterTemplateId: string,
    dpIds: string[],
  ): Promise<MasterTemplate[]> {
    return this.masterTemplateService.findMasterTemplateDecisionPointByIds(
      masterTemplateId,
      dpIds,
    );
  }

  async addSpecialProvisions(
    playbookId: Playbook,
    masterTemplateDecisionPoint: MasterTemplateDecisionPoint[],
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> {
    return this.playbookDecisionPointsService.addSpecialProvisions(
      playbookId,
      masterTemplateDecisionPoint,
      transactionQueryRunner,
    );
  }

  async updateTotalDpCountPlaybook(
    playbookId: string,
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> {
    return this.playbookRepository.updateTotalDpCountPlaybook(
      playbookId,
      transactionQueryRunner,
    );
  }

  async removeSpecialDps(
    playbookId: string,
    dpIds: string[],
    transactionQueryRunner?: QueryRunner,
  ) {
    return this.playbookDecisionPointsService.removeSpecialDps(
      playbookId,
      dpIds,
      transactionQueryRunner,
    );
  }

  async getPlaybookSpecialDpByPlaybookId(playbookId: string): Promise<any> {
    return this.playbookDecisionPointsService.getPlaybookSpecialDpByPlaybookId(
      playbookId,
    );
  }
}
