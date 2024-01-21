import { Status } from "@grpc/grpc-js/build/src/constants";
import { RpcException } from "@nestjs/microservices";
import type user from "../interfaces";

export default new (class Helper {
  public getUserFromMetadata(metadata: any) {
    const user = metadata.get("user");
    if (!user || !user.length)
      throw new RpcException({
        code: Status.INTERNAL,
        message: "Internal Server Error",
      });

    return user[0] as user;
  }
})();
