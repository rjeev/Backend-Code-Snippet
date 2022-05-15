import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { MasterTemplate } from 'src/models/entities/MasterTemplate.entity';
import { Playbook } from 'src/models/entities/Playbook.entity';
import { PlaybookUser } from 'src/models/entities/PlaybookUser.entity';
import AUTH_RESPONSE from '../auth/auth.constants';
import { UnauthorizedResponseDto } from '../auth/dto';
import { PlaybookUserService } from '../playbook-user/playbook-user.service';
import { UserProfile } from '../users/users.interface';
import PLAYBOOK_RESPONSE from './playbook-response-message.constant';
import { PLAYBOOK_SPECIAL_PROVISION_RESPONSE } from './dto/special-provision.constant';
import { PlaybooksService } from './playbooks.service';
import { MasterTemplateService } from '../master-template/master-template.service';
import {
  ArchivePlaybookSuccessResponseDto,
  ArchivePlaybookDto,
  UserPlaybookCountByStatusType,
  DeletePlaybookDto,
  PlaybookNotFoundResponseDto,
  DeletePlaybookSuccessResponseDto,
  ListPlaybookSuccessResponseDto,
  CreatePlaybookDto,
  CreatePlaybookSuccessResponseDto,
  MasterTemplateNotFoundResponseDto,
  DuplicatePlaybookDto,
  DuplicatePlaybookSuccessResponseDto,
  DuplicatePlaybookParamDto,
  GetSpecialDto,
  ListSpecialProvisionSuccessResponseDto,
  AddSpecialParamsDto,
  AddSpecialBodyDto,
  AddSpecialProvisionResponseDto,
  PlaybookStatusFilterDto,
  PlaybookByIdDtoResponse,
  PlaybookByIdDto,
  DeleteDpSuccess,
  DeleteDpPBadRequest,
  DeleteSpecialDpBodyDto,
  DeleteSpecialDpParamDto,
} from './dto';
import { PlaybookUserRepository } from '../playbook-user/playbook-user.repository';
import {
  PlaybookNotFound,
  SpecialProvisionNotFound,
} from './playbook.exception';

@ApiTags('Playbooks')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: AUTH_RESPONSE.ACCESS_TOKEN_REQUIRED.MESSAGE,
  type: UnauthorizedResponseDto,
})
@Controller('playbooks')
export class PlaybooksController {
  constructor(
    private readonly playbookService: PlaybooksService,
    private readonly playbookUserService: PlaybookUserService,
    private readonly playbookUserRepository: PlaybookUserRepository,
    private readonly materTemplateRepository: MasterTemplateService,
    private readonly connection: Connection,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.LIST,
    type: ListPlaybookSuccessResponseDto,
  })
  @ApiOperation({
    summary:
      'Fetch all playbooks that has been shared to the authenticated user',
  })
  @Get()
  async getPlaybooks(
    @CurrentUser() currentUser: UserProfile,
    @Query()
    playbookStatusFilterDto: PlaybookStatusFilterDto,
  ) {
    try {
      const playbooks: PlaybookUser[] =
        await this.playbookUserService.getUserPlaybooks(
          currentUser.id,
          playbookStatusFilterDto.status,
        );
      const playbooksCountByStatus: UserPlaybookCountByStatusType[] =
        await this.playbookUserService.getUserPlaybooksCountByStatus(
          currentUser.id,
          playbookStatusFilterDto.status,
        );

      const tranformPlaybooks: Playbook[] =
        this.playbookService.transformUserPlaybooks(playbooks);
      return {
        statusCode: HttpStatus.OK,
        message: PLAYBOOK_RESPONSE.LIST,
        data: {
          counts: playbooksCountByStatus,
          list: tranformPlaybooks,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.GET_PLAYBOOK_ID,
    type: PlaybookByIdDtoResponse,
  })
  @ApiOperation({
    summary: 'Fetch user playbook by playbook id',
  })
  @Get('/:id')
  async getPlaybookById(
    @CurrentUser() currentUser: UserProfile,
    @Param() playbookById: PlaybookByIdDto,
  ) {
    try {
      const hasAccessToPlaybook =
        await this.playbookUserRepository.checkIsUserPlaybook(
          currentUser.id,
          playbookById.id,
        );

      if (!hasAccessToPlaybook) {
        throw new PlaybookNotFound();
      }

      const userPlaybook: PlaybookUser =
        await this.playbookUserService.getUserPlaybooksById(
          playbookById.id,
          currentUser.id,
        );
      return {
        statusCode: HttpStatus.OK,
        message: PLAYBOOK_RESPONSE.GET_PLAYBOOK_ID,
        data: userPlaybook.playbook,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.ARCHIVE,
    type: ArchivePlaybookSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: PLAYBOOK_RESPONSE.NOT_FOUND,
    type: PlaybookNotFoundResponseDto,
  })
  @Patch('/archive')
  async archivePlaybook(@Body() archivePlaybookDto: ArchivePlaybookDto) {
    try {
      await this.playbookService.archivePlaybook(archivePlaybookDto.id);
      return {
        statusCode: HttpStatus.OK,
        message: PLAYBOOK_RESPONSE.ARCHIVE,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.DELETE,
    type: DeletePlaybookSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: PLAYBOOK_RESPONSE.NOT_FOUND,
    type: PlaybookNotFoundResponseDto,
  })
  @Delete('/:id')
  async deletePlaybook(@Param() deletePlaybookDto: DeletePlaybookDto) {
    try {
      await this.playbookService.deletePlaybook(deletePlaybookDto.id);
      return {
        statusCode: HttpStatus.OK,
        message: PLAYBOOK_RESPONSE.DELETE,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: PLAYBOOK_RESPONSE.CREATED.SUCCESS,
    type: CreatePlaybookSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: PLAYBOOK_RESPONSE.CREATED.MASTER_TEMPLATE_NOT_FOUND,
    type: MasterTemplateNotFoundResponseDto,
  })
  async createPlaybook(
    @Body() createPlaybookDto: CreatePlaybookDto,
    @CurrentUser() currentUser: UserProfile,
  ) {
    try {
      const playbook: Playbook = await this.playbookService.createPlaybook(
        createPlaybookDto,
        currentUser,
      );

      const playbookResponse: Partial<Playbook> = {
        id: playbook.id,
        name: playbook.name,
        playbookType: playbook.playbookType,
        status: playbook.status,
        shortDesc: playbook.shortDesc,
        created: playbook.created,
      };

      return {
        statusCode: HttpStatus.CREATED,
        message: PLAYBOOK_RESPONSE.CREATED.SUCCESS,
        data: playbookResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/:playbookId/duplicate')
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: PLAYBOOK_RESPONSE.CREATED.SUCCESS,
    type: DuplicatePlaybookSuccessResponseDto,
  })
  async duplicatePlaybook(
    @Param() duplicatePlaybookParamDto: DuplicatePlaybookParamDto,
    @Body() duplicatePlaybookDto: DuplicatePlaybookDto,
    @CurrentUser() currentUser: UserProfile,
  ): Promise<DuplicatePlaybookSuccessResponseDto> {
    try {
      const hasAccessToPlaybook =
        await this.playbookUserRepository.checkIsUserPlaybook(
          currentUser.id,
          duplicatePlaybookParamDto.playbookId,
        );
      if (!hasAccessToPlaybook) {
        throw new PlaybookNotFound();
      }
      const playbook: Playbook = await this.playbookService.duplicatePlaybook(
        duplicatePlaybookParamDto,
        duplicatePlaybookDto,
        currentUser,
      );
      const playbookResponse: Partial<Playbook> = {
        id: playbook.id,
        name: playbook.name,
        playbookType: playbook.playbookType,
        status: playbook.status,
        shortDesc: playbook.shortDesc,
        created: playbook.created,
      };
      return {
        statusCode: HttpStatus.CREATED,
        message: PLAYBOOK_RESPONSE.DUPLICATE.SUCCESS,
        data: playbookResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.SPECIAL_PROVISION_LIST,
    type: ListSpecialProvisionSuccessResponseDto,
  })
  @ApiOperation({
    summary: 'Fetch special provisions in master template',
  })
  @Get('/:playbookId/special-provision')
  async addSpecialProvision(@Param() getSpecialDto: GetSpecialDto) {
    try {
      const playbookDetail = await this.playbookService.findPlaybookById(
        getSpecialDto.playbookId,
        false,
        true,
      );

      if (!playbookDetail) {
        throw new PlaybookNotFound();
      }

      const specialProvision: MasterTemplate[] =
        await this.materTemplateRepository.findMasterTemplateWithSpecialDecisionPoint(
          playbookDetail.masterTemplate.id,
        );

      if (
        specialProvision.length === 0 ||
        specialProvision[0].masterTemplateDecisionPoints.length === 0
      ) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: PLAYBOOK_RESPONSE.SPECIAL_PROVISION_LIST_EMPTY,
          data: null,
        };
      } else {
        const specialPlaybookDp =
          await this.playbookService.getPlaybookSpecialDpByPlaybookId(
            getSpecialDto.playbookId,
          );

        const pDSpecialProvision: any[] =
          specialProvision[0].masterTemplateDecisionPoints;

        specialProvision[0].masterTemplateDecisionPoints.map((mdP, key) => {
          specialPlaybookDp.forEach((pdP) => {
            if (pdP.displayLabel === mdP.displayLabel) {
              pDSpecialProvision[key].playbookDpId = pdP.id;
              pDSpecialProvision[key].exists = true;
            }
          });
        });

        return {
          statusCode: HttpStatus.OK,
          message: PLAYBOOK_RESPONSE.SPECIAL_PROVISION_LIST,
          data: pDSpecialProvision,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: PLAYBOOK_RESPONSE.SPCIAL_PROVISION_ADDED,
    type: AddSpecialProvisionResponseDto,
  })
  @ApiOperation({
    summary: 'Add special provision to playbook',
  })
  @Post('/:playbookId/special-provision')
  async getSpecialProvision(
    @CurrentUser() currentUser: UserProfile,
    @Param() addSpecialParams: AddSpecialParamsDto,
    @Body() addSpecialBody: AddSpecialBodyDto,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hasAccessToPlaybook =
        await this.playbookUserRepository.checkIsUserPlaybook(
          currentUser.id,
          addSpecialParams.playbookId,
        );

      if (!hasAccessToPlaybook) {
        throw new PlaybookNotFound();
      }

      const playbookDetail = await this.playbookService.findPlaybookById(
        addSpecialParams.playbookId,
        false,
        true,
      );

      if (!playbookDetail) {
        throw new PlaybookNotFound();
      }
      const dps =
        await this.playbookService.findMasterTemplateDecisionPointByIds(
          playbookDetail.masterTemplate.id,
          addSpecialBody.decisionPointIds,
        );
      if (
        dps.length === 0 ||
        dps[0].masterTemplateDecisionPoints.length === 0
      ) {
        throw new SpecialProvisionNotFound();
      }

      try {
        // Adding special provisions, wait till all provisions are added
        await this.playbookService.addSpecialProvisions(
          playbookDetail,
          dps[0].masterTemplateDecisionPoints,
          queryRunner,
        );
        // Update dpCount depends on dps in special provisions
        await this.playbookService.updateTotalDpCountPlaybook(
          playbookDetail.id,
          queryRunner,
        );
        await queryRunner.commitTransaction();
        return {
          statusCode: HttpStatus.OK,
          message: PLAYBOOK_RESPONSE.SPCIAL_PROVISION_ADDED,
        };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      throw error;
    }
  }

  @Put('/:playbookId/special-provision')
  @ApiOperation({
    summary: 'Remove special provisions from playbook',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description:
      PLAYBOOK_SPECIAL_PROVISION_RESPONSE.DELETE_SPECIAL_PROVISION.SUCCESS,
    type: DeleteDpSuccess,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      PLAYBOOK_SPECIAL_PROVISION_RESPONSE.DELETE_SPECIAL_PROVISION.BAD_REQUEST,
    type: DeleteDpPBadRequest,
  })
  async deleteSpecialDecisionPoint(
    @CurrentUser() currentUser: UserProfile,
    @Param() deleteSpecialDpParam: DeleteSpecialDpParamDto,
    @Body() deleteSpecialDpBody: DeleteSpecialDpBodyDto,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hasAccessToPlaybook =
        await this.playbookUserRepository.checkIsUserPlaybook(
          currentUser.id,
          deleteSpecialDpParam.playbookId,
        );
      if (!hasAccessToPlaybook) {
        throw new PlaybookNotFound();
      }

      await this.playbookService.removeSpecialDps(
        deleteSpecialDpParam.playbookId,
        deleteSpecialDpBody.decisionPointIds,
        queryRunner,
      );
      // Update dpCount depends on dps in special provisions
      await this.playbookService.updateTotalDpCountPlaybook(
        deleteSpecialDpParam.playbookId,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return {
        statusCode: HttpStatus.OK,
        message:
          PLAYBOOK_SPECIAL_PROVISION_RESPONSE.DELETE_SPECIAL_PROVISION.SUCCESS,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
