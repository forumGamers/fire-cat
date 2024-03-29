import { Controller, UseInterceptors } from "@nestjs/common";
import { USER_SERVICE } from "../../constants/proto.constant";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AuthenticationInterceptor } from "../../middlewares/authentication.middlewares";
import helpers from "../../helpers";
import { UserServiceMethod } from "../../enum/services.enum";
import encryption from "../../utils/encryption";
import { Metadata } from "@grpc/grpc-js";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE, UserServiceMethod.GetMultipleUser)
  @UseInterceptors(AuthenticationInterceptor)
  public async getMultipleUser({ ids }: { ids: string[] }, metadata: Metadata) {
    if (!ids || !ids.length)
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: "parameter ids is required",
      });

    const data: string[] = [];
    ids.forEach((el) => {
      if (
        !data.includes(el) &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
          el
        ) &&
        el
      )
        data.push(el);
    });

    if (data.length > 25)
      throw new RpcException({
        message: "Data limit exceeded",
        code: Status.RESOURCE_EXHAUSTED,
      });

    if (!data.length)
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: "ids is not valid",
      });

    const user = helpers.getUserFromMetadata(metadata);
    const users = await this.userService.getMultipleUserByIds(data);
    if (!users.rowLength)
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: "data not found",
      });

    return {
      data: users.rows.map((el) => ({
        ...el,
        email: encryption.decrypt(el.email),
        username: encryption.decrypt(el.username),
        isFollowing:
          el.followers &&
          el.followers.length &&
          user &&
          el.followers.find((el: string) => el === user?.id)
            ? true
            : false,
      })),
    };
  }

  @GrpcMethod(USER_SERVICE, UserServiceMethod.Me)
  @UseInterceptors(AuthenticationInterceptor)
  public me(_: never, metadata: Metadata) {
    return { data: helpers.getUserFromMetadata(metadata) };
  }

  @GrpcMethod(USER_SERVICE, UserServiceMethod.GetFollowingRecomendation)
  @UseInterceptors(AuthenticationInterceptor)
  public async getFollowingRecomendation(_: never, metadata: Metadata) {
    const user = helpers.getUserFromMetadata(metadata);

    const data = await this.userService.getFollowingRecomendation();
    if (!data.rowLength)
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: "data not found",
      });

    return {
      data: data.rows
        .filter((row) => !(user?.following || []).includes(row.id.toString()))
        .map((el) => ({
          ...el,
          email: encryption.decrypt(el.email),
          username: encryption.decrypt(el.username),
        })),
    };
  }

  @GrpcMethod(USER_SERVICE, UserServiceMethod.GetUserById)
  @UseInterceptors(AuthenticationInterceptor)
  public async findById({ id }: { id: string }) {
    if (!id)
      throw new RpcException({
        code: Status.INVALID_ARGUMENT,
        message: "id is required",
      });

    const user = await this.userService.findOneById(id);
    if (!user.rowLength)
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: "user not found",
      });

    const data = user.first();
    return {
      data: {
        ...data,
        email: encryption.decrypt(data.email),
        username: encryption.decrypt(data.username),
      },
    };
  }
}
