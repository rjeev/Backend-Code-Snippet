import { InjectConnection } from '@nestjs/typeorm';
import { EntityRepository, QueryRunner, Repository, Connection } from 'typeorm';

import { Playbook } from 'src/models/entities/Playbook.entity';
import { PlaybookStatusType } from './playbooks.interface';

@EntityRepository(Playbook)
export class PlaybookRepository extends Repository<Playbook> {
  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }
  updatePlaybookStatus = async (
    playbookId: string,
    status: PlaybookStatusType,
  ): Promise<any> => {
    return this.update(
      {
        id: playbookId,
      },
      {
        status: status,
      },
    );
  };

  incrementConfirmedDPCount = async (
    playbookId: string,
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> => {
    if (transactionQueryRunner) {
      return transactionQueryRunner.manager
        .createQueryBuilder()
        .update(Playbook)
        .set({ confirmedDPCount: () => 'confirmed_dp_count + 1' })
        .where('id = :playbookId', { playbookId })
        .execute();
    }

    return this.createQueryBuilder()
      .update(Playbook)
      .set({ confirmedDPCount: () => 'confirmed_dp_count + 1' })
      .where('id = :playbookId', { playbookId })
      .execute();
  };

  updateTotalDpCountPlaybook = async (
    playbookId: string,
    transactionQueryRunner?: QueryRunner,
  ): Promise<any> => {
    const query = `SELECT
                  SUM( (CHAR_LENGTH(content) - CHAR_LENGTH(REPLACE(content, '[#np_', ''))) 
                  / CHAR_LENGTH('[#np_')) + SUM( (CHAR_LENGTH(content) - CHAR_LENGTH(REPLACE(content, '[#anp_', ''))) 
                  / CHAR_LENGTH('[#anp_')) as sum
                  FROM playbook_decision_point where position !=2 AND playbook_id=$1`;
    let totalDp: any = [];
    if (transactionQueryRunner) {
      totalDp = await transactionQueryRunner.manager.query(query, [playbookId]);
    } else {
      totalDp = await this.connection.query(query, [playbookId]);
    }

    if (totalDp.length > 0) {
      if (transactionQueryRunner) {
        return transactionQueryRunner.manager
          .createQueryBuilder()
          .update(Playbook)
          .set({ totalDPCount: () => totalDp[0].sum })
          .where('id=:playbookId', { playbookId })
          .execute();
      }
      return this.createQueryBuilder()
        .update(Playbook)
        .set({ totalDPCount: () => totalDp[0].sum })
        .where('id=:playbookId', { playbookId })
        .execute();
    }
  };
}
