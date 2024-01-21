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
    )) as types.ResultSet & { rows: (types.Row & user)[] };
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

  public async getFollowingRecomendation() {
    //bisa di refactor nanti
    return await this.client.execute(
      `SELECT * FROM users WHERE created_at >= dateOf(now()) - 7d AND created_at <= dateOf(now()) LIMIT 30 ALLOW FILTERING;`,
      [],
      { prepare: true },
    );
  }

  public async insertOne({
    id,
    fullname,
    username,
    email,
    password,
    is_verified,
    bio,
    image_url,
    background_url,
    status,
    created_at,
    updated_at,
    store_id,
    division,
    role,
    following,
    followers,
  }: user) {
    return await this.client.execute(
      `INSERT INTO users (
            id, 
            fullname, 
            username,
            email, 
            password, 
            is_verified, 
            bio, 
            image_url, 
            background_url, 
            status, 
            created_at, 
            updated_at, 
            store_id, 
            division, 
            role,
            following,
            followers,
            access_token,
            token_as
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        fullname,
        username,
        email,
        password,
        is_verified,
        bio,
        image_url,
        background_url,
        status,
        created_at,
        updated_at,
        store_id,
        division,
        role,
        following,
        followers,
        '',
        '',
      ],
    );
  }

  public async updateToken({
    access_token,
    token_as,
    id,
  }: {
    access_token: string;
    token_as: 'User' | 'Admin' | 'Seller';
    id: string;
  }) {
    return await this.client.execute(
      `
      UPDATE users
      SET access_token = ?, token_as = ?
      WHERE id = ?
      `,
      [access_token, token_as, id],
    );
  }

  public async getUserProfileByIds(ids: string[]) {
    return await this.client.execute(
      `
      SELECT * FROM users
      WHERE id IN (${Array(ids.length).fill('?').join(', ')});
      `,
      ids,
      { prepare: true },
    );
  }

  public async updateUserImage(id: string, imageUrl: string, imageId: string) {
    return await this.client.execute(
      `
      UPDATE users
      SET image_url = ?, image_id = ?
      WHERE id = ?
      `,
      [imageUrl, imageId, id],
      { prepare: true },
    );
  }

  public async updateUserBackgroundImg(
    id: string,
    backgroundUrl: string,
    backgroundId: string,
  ) {
    return await this.client.execute(
      `
      UPDATE users
      SET background_url = ?, background_id = ?
      WHERE id = ?
      `,
      [backgroundUrl, backgroundId, id],
      { prepare: true },
    );
  }

  public async updateUserInfo(id: string, username: string, bio: string) {
    return await this.client.execute(
      `
      UPDATE users 
      SET username = ?, bio = ?
      Where id = ?
      `,
      [username, bio, id],
      { prepare: true },
    );
  }
}
