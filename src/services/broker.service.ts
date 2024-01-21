import amqp, { type ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { UserService } from '../modules/user/user.service';
import type IUser from '../interfaces';

config();

@Injectable()
export class ConsumerService {
  private channelWrapper: ChannelWrapper;

  protected newUserQueue = 'New-User-Queue';
  protected updateUserQueue = 'Update-User-Queue';
  protected loginUserQueue = 'Login-User-Queue';
  protected userChangeProfile = 'User-Change-Profile';
  protected userChangeBackground = 'User-Change-Background';
  protected userChangeInfo = 'User-Change-Info';
  protected userQueues: string[] = [
    this.newUserQueue,
    this.loginUserQueue,
    this.updateUserQueue,
    this.userChangeProfile,
    this.userChangeBackground,
    this.userChangeInfo,
  ];

  protected userExchange = 'User-Exchanges';
  protected exchanges: string[] = [this.userExchange];

  constructor(private readonly userService: UserService) {
    const connection = amqp.connect(process.env.RABBIT_MQ_URL);
    this.channelWrapper = connection.createChannel({
      setup: async (channel: Channel) => {
        channel.consume(this.newUserQueue, async (msg) => {
          try {
            if (msg) {
              const user: IUser = JSON.parse(msg.content.toString());

              user.created_at = new Date(user.created_at);
              user.updated_at = new Date(user.updated_at);
              user.division = '' as any;
              user.role = '' as any;
              user.following = [] as string[];
              user.followers = [] as string[];
              await this.userService.insertOne(user);
              channel.ack(msg);
            }
          } catch (err) {
            console.error(err);
          }
        });

        channel.consume(this.loginUserQueue, async (msg) => {
          try {
            if (msg) {
              const token = JSON.parse(msg.content.toString());
              await this.userService.updateToken({
                access_token: token.access_token,
                token_as: token.as,
                id: token.user_id,
              });
              channel.ack(msg);
            }
          } catch (err) {
            console.error(err);
          }
        });

        channel.consume(this.userChangeProfile, async (msg) => {
          try {
            if (msg) {
              const data: IUser = JSON.parse(msg.content.toString());
              await this.userService.updateUserImage(
                data.id,
                data.image_url,
                data.image_id,
              );
              channel.ack(msg);
            }
          } catch (err) {
            console.error(err);
          }
        });

        channel.consume(this.userChangeBackground, async (msg) => {
          try {
            if (msg) {
              const data: IUser = JSON.parse(msg.content.toString());
              await this.userService.updateUserImage(
                data.id,
                data.background_url,
                data.background_id,
              );
              channel.ack(msg);
            }
          } catch (err) {
            console.error(err);
          }
        });

        channel.consume(this.userChangeInfo, async (msg) => {
          try {
            if (msg) {
              const data: IUser = JSON.parse(msg.content.toString());
              await this.userService.updateUserInfo(
                data.id,
                data.username,
                data.bio,
              );
              channel.ack(msg);
            }
          } catch (err) {
            console.error(err);
          }
        });

        return channel;
      },
    });
  }
}
