import { Controller, UseInterceptors } from "@nestjs/common";
import { USER_SERVICE } from "../../constants/proto.constant";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AuthenticationInterceptor } from "../../middlewares/authentication.middlewares";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_SERVICE, "GetMultipleUser")
  @UseInterceptors(AuthenticationInterceptor)
  public async getMultipleUser({ ids }: { ids: string[] }, metadata: any) {
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

    const user = metadata.get("user")[0];
    const users = await this.userService.getMultipleUserByIds(data);
    if (!users.rowLength)
      throw new RpcException({
        code: Status.NOT_FOUND,
        message: "data not found",
      });

    return {
      data: users.rows.map((el) => ({
        ...el,
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
}
