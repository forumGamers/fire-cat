import { InjectCassandra } from '@mich4l/nestjs-cassandra';
import { Injectable } from '@nestjs/common';
import { Client, type types } from 'cassandra-driver';
import user from '../../interfaces';

@Injectable()
export class UserService {
  constructor(@InjectCassandra() private readonly client: Client) {}

  public async findOneById(id: string) {
    return (await this.client.execute(
      `SELECT * FROM users WHERE id = ?`,
      [id],
      {
        prepare: true,
      },
    )) as types.ResultSet & { rows: types.Row & user };
  }

  public async getMultipleUserByIds(ids: string[]) {
    return await this.client.execute(
      `
        SELECT * FROM users
        WHERE id IN (${Array(ids.length).fill('?').join(', ')});
        `,
      ids,
      { prepare: true },
    );
  }
}
